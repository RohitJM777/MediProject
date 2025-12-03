const router = require("express").Router();
const { analyzeOrder } = require("../controllers/ai.controller");

router.get("/analyze/:orderId", analyzeOrder);

module.exports = router;
