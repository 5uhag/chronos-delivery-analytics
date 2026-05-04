const router = require('express').Router();
const Delivery = require('../models/Delivery');

// GET /api/time-analysis?area=
// Returns avg delay and order count grouped by hour of day
router.get('/', async (req, res) => {
  try {
    const { area } = req.query;
    const match = area ? { restaurant_area: area } : {};

    const data = await Delivery.aggregate([
      { $match: match },
      {
        $group: {
          _id:       '$order_hour',
          avg_delay: { $avg: '$delay_mins' },
          avg_time:  { $avg: '$delivery_time_mins' },
          count:     { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          hour:      '$_id',
          avg_delay: { $round: ['$avg_delay', 2] },
          avg_time:  { $round: ['$avg_time', 2] },
          count: 1,
        },
      },
      { $sort: { hour: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
