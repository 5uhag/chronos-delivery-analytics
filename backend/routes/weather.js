const router = require('express').Router();
const Delivery = require('../models/Delivery');

// GET /api/weather-impact?area=
// Returns avg delay grouped by weather condition (optionally per area)
router.get('/', async (req, res) => {
  try {
    const { area } = req.query;
    const match = area ? { restaurant_area: area } : {};

    const data = await Delivery.aggregate([
      { $match: match },
      {
        $group: {
          _id: { weather: '$weather', area: '$restaurant_area' },
          avg_delay: { $avg: '$delay_mins' },
          count:     { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          weather: '$_id.weather',
          area:    '$_id.area',
          avg_delay: { $round: ['$avg_delay', 2] },
          count: 1,
        },
      },
      { $sort: { avg_delay: -1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
