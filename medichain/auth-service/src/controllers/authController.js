const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const redis = require("../lib/redis");
const { registerSchema } = require("../validators/auth");
const crypto = require("crypto");

// ------------------------------------------------------
// JWT Helpers
// ------------------------------------------------------
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXP || "15m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXP || "7d",
  });
};

// ------------------------------------------------------
// REGISTER CONTROLLER
// ------------------------------------------------------
exports.register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const user = new User({ name, email, password, role });
    await user.save();

    const accessToken = createAccessToken({ userId: user._id, role: user.role });
    const refreshToken = createRefreshToken({ userId: user._id });

    // Store refresh token in Redis
    await redis.set(`refresh:${user._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------------------------------------------
// LOGIN CONTROLLER
// ------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = createAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = createRefreshToken({ userId: user._id });

    // Store in Redis (not local memory!)
    await redis.set(`refresh:${user._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------------------------------------------
// REFRESH TOKEN
// ------------------------------------------------------
exports.refresh = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(400).json({ error: "Missing token" });

    const token = authHeader.split(" ")[1]; // Extract token

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ error: "Invalid token" });

      const stored = await redis.get(`refresh:${decoded.userId}`);
      if (!stored || stored !== token)
        return res.status(401).json({ error: "Invalid token" });

      const accessToken = createAccessToken({
        userId: decoded.userId,
      });

      res.json({ accessToken });
    });
  } catch (err) {
    console.error("Refresh Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------------------------------------------
// LOGOUT
// ------------------------------------------------------
exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.json({ success: true });

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (!err) {
        await redis.del(`refresh:${decoded.userId}`); // Delete token
      }
      return res.json({ success: true });
    });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// ------------------------------------------------------
// PASSWORD RESET REQUEST
// ------------------------------------------------------
exports.passwordResetRequest = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Missing email" });

    const user = await User.findOne({ email });

    // Always return success to avoid leaking user existence
    if (!user) return res.status(200).json({ success: true });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");

    // Store token in redis for 15 minutes
    await redis.set(`pwdreset:${user._id}`, token, "EX", 15 * 60);

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${token}&uid=${user._id}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click here to reset your password:</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Password Reset Request Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
