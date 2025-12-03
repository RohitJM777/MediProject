const router = require("express").Router();
const controller = require("../controllers/pharmacist.controller");

router.get("/all", controller.getAll);
router.put("/approve/:id", controller.approveOrder);
router.put("/reject/:id", controller.rejectOrder);

module.exports = router;
