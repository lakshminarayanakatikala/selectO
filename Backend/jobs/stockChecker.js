// const cron = require("node-cron");
// const Product = require("../models/ProductModel");
// const Notification = require("../models/notificationModel");

// // Runs every 1 hours 
// cron.schedule("0 * * * *", async () => {
//   console.log("🔁 Running stock check job...");

//   try {
//     const lowStockProducts = await Product.find({ quantitie: { $lt: 10 } });

//     for (const product of lowStockProducts) {
//       const type = product.quantitie <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK";
//       const message =
//         product.quantitie <= 0
//           ? `${product.name} is out of stock!`
//           : `${product.name} stock is low (${product.quantitie} left)!`;

//       // Prevent duplicate notifications for same condition
//       const alreadyNotified = await Notification.findOne({
//         sellerId: product.sellerId,
//         message,
//         type,
//       });

//       if (!alreadyNotified) {
//         await Notification.create({
//           sellerId: product.sellerId,
//           message,
//           type,
//         });
//       }
//     }

//     console.log("✅ Stock check completed");
//   } catch (error) {
//     console.error("❌ Error running stock check:", error);
//   }
// });


const Product = require("../models/ProductModel");
const Notification = require("../models/notificationModel");

module.exports = async function checkLowStock() {
  try {
    console.log("🔁 Running stock check job...");

    // ✅ change quantitie → stock if your schema uses stock
    const lowStockProducts = await Product.find({ quantitie: { $lt: 10 } });

    console.log(`🧾 Found ${lowStockProducts.length} low stock products`);

    for (const product of lowStockProducts) {
      console.log(
        `➡️ Checking product: ${product.name}, Qty: ${product.quantitie}`
      );

      const existing = await Notification.findOne({
        sellerId: product.sellerId,
        message: { $regex: product.name, $options: "i" },
      });

      if (!existing) {
        await Notification.create({
          sellerId: product.sellerId,
          message: `⚠️ Low stock alert: ${product.name} has only ${product.quantitie} items left.`,
          isRead: false,
        });

        console.log(`📢 Notification created for product: ${product.name}`);
      } else {
        console.log(`⚙️ Notification already exists for ${product.name}`);
      }
    }

    console.log("✅ Stock check completed.");
  } catch (error) {
    console.error("❌ Error running stock check:", error);
  }
};
