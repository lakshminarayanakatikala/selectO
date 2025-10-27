const cron = require("node-cron");
const Product = require("../models/ProductModel");
const Notification = require("../models/notificationModel");

// Runs every 1 hours 
cron.schedule("0 * * * *", async () => {
  console.log("🔁 Running stock check job...");

  try {
    const lowStockProducts = await Product.find({ quantitie: { $lt: 10 } });

    for (const product of lowStockProducts) {
      const type = product.quantitie <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK";
      const message =
        product.quantitie <= 0
          ? `${product.name} is out of stock!`
          : `${product.name} stock is low (${product.quantitie} left)!`;

      // Prevent duplicate notifications for same condition
      const alreadyNotified = await Notification.findOne({
        sellerId: product.sellerId,
        message,
        type,
      });

      if (!alreadyNotified) {
        await Notification.create({
          sellerId: product.sellerId,
          message,
          type,
        });
      }
    }

    console.log("✅ Stock check completed");
  } catch (error) {
    console.error("❌ Error running stock check:", error);
  }
});
