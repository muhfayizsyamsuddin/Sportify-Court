const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authentication");
const paymentController = require("../controllers/paymentController");
const errorHandler = require("../middleware/errorHandler");

// ==========================
// MIDTRANS WEBHOOK
// ==========================
router.post(
  "/midtrans/notification",
  paymentController.midtransNotification
);

router.use(authentication);

router.patch("/me/upgrade", paymentController.upgradeAccount); // hanya user yang login
router.post("/midtrans/initiate", paymentController.initiateMidtransTrx);
// error handler
router.use(errorHandler);

module.exports = router;
