const router = require('express').Router();
const Delivery = require('../models/Delivery');
const Area = require('../models/Area');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const [totalOrders, avgDelayResult, worstArea, worstWeatherResult] = await Promise.all([
      Delivery.countDocuments(),
      Delivery.aggregate([{ $group: { _id: null, avg: { $avg: '$delay_mins' } } }]),
      Area.findOne().sort({ avg_delay_mins: -1 }).lean(),
      Delivery.aggregate([
        { $group: { _id: '$weather', avg_delay: { $avg: '$delay_mins' } } },
        { $sort: { avg_delay: -1 } },
        { $limit: 1 },
      ]),
    ]);

    res.json({
      total_orders:   totalOrders,
      avg_delay_mins: avgDelayResult[0]?.avg?.toFixed(2) ?? 0,
      worst_area:     worstArea?.name ?? 'N/A',
      worst_weather:  worstWeatherResult[0]?._id ?? 'N/A',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
