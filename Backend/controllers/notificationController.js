// const Notification = require("../models/notificationModel");

// // Get all notifications for a seller
// exports.getSellerNotifications = async (req, res) => {
//   try {
//     const sellerId = req.seller._id;
//     const notifications = await Notification.find({ sellerId }).sort({
//       createdAt: -1,
//     });

//     res.status(200).json({
//       success: true,
//       notifications,
//     });
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // Mark notification as read
// exports.markAsRead = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const sellerId = req.seller._id;

//     const notification = await Notification.findOneAndUpdate(
//       { _id: id, sellerId },
//       { isRead: true },
//       { new: true }
//     );

//     if (!notification) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Notification not found" });
//     }

//     res.status(200).json({ success: true, notification });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
