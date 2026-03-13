// import Product from "../models/Product.js";
// import User from "../models/User.js";
// //import Order from "../models/Order.js";
// import { getLiveMetalRates } from "../services/metalPriceService.js";

// export const getAdminDashboardStats = async (req, res) => {
//   try {
//     const totalProducts = await Product.countDocuments();
//     const totalUsers = await User.countDocuments();
//     const totalOrders = await Order.countDocuments();

//     // Today revenue
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const todayOrders = await Order.find({
//       createdAt: { $gte: today },
//       status: "Delivered",
//     });

//     const todayRevenue = todayOrders.reduce(
//       (sum, o) => sum + o.totalAmount,
//       0
//     );

//     // Live metal rates
//     const rates = await getLiveMetalRates();

//     res.json({
//       totalProducts,
//       totalUsers,
//       totalOrders,
//       todayRevenue,
//       goldRate: rates.gold,
//       silverRate: rates.silver,
//     });
//   } catch (err) {
//     console.error("Dashboard stats error:", err);
//     res.status(500).json({ message: "Dashboard stats failed" });
//   }
// };
import Product from "../models/Product.js";
import User from "../models/User.js";
import { getLiveMetalRates } from "../services/metalPriceService.js";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const lowStockProducts = await Product.find({
      stock: { $gt: 0, $lte: 5 }, // Only show low stock for products with stock > 0 and <= 5
    }).select("name stock");
    const totalCoupons = await Coupon.countDocuments();

    // Dates
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // include today
    sevenDaysAgo.setHours(0, 0, 0, 0); // reset time

    const todayUsers = await User.countDocuments({
      createdAt: { $gte: todayStart },
    });

    const todayProducts = await Product.countDocuments({
      createdAt: { $gte: todayStart },
    });

    const last7DaysUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const last7DaysProducts = await Product.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const totalRevenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$priceBreakup.totalAmount" } } },
    ]);

    const todayRevenueAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart },
          orderStatus: { $ne: "cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$priceBreakup.totalAmount" } } },
    ]);

    const totalRevenue = Math.round((totalRevenueAgg[0]?.total || 0) * 100) / 100;
    const todayRevenue = Math.round((todayRevenueAgg[0]?.total || 0) * 100) / 100;

    // 🔥 RECENT PRODUCTS (NEW)
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name category price createdAt");

    const rates = await getLiveMetalRates();

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      todayRevenue,
      totalRevenue,
      goldRate: rates.gold,
      silverRate: rates.silver,
      lowStockProducts,
      totalCoupons,
      todayUsers,
      todayProducts,
      last7DaysUsers,
      last7DaysProducts,

      // 👇 NEW
      recentProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard stats failed" });
  }
};
export const getGrowthAnalytics = async (req, res) => {
  try {
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
console.log("Range:", dayStart, "to", dayEnd);
      const users = await User.countDocuments({
        createdAt: {
          $gte: dayStart,
          $lt: dayEnd
        },
      });

      const products = await Product.countDocuments({
        createdAt: {
          $gte: dayStart,
          $lt: dayEnd
        },
      });

      last7Days.push({
        date: dayStart.toISOString().split("T")[0], // SAFE FORMAT
        users,
        products,
      });
    }
const sample = await Product.findOne().sort({createdAt:-1});
console.log("Latest Product Date:", sample.createdAt);
    res.json(last7Days);
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Analytics failed" });
  }
};

