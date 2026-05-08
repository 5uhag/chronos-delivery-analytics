const router = require('express').Router();
const Delivery = require('../models/Delivery');

const TRAFFIC_ORDER = ['Low', 'Medium', 'High', 'Jam'];

// GET /api/traffic-analysis?area=
router.get('/', async (req, res) => {
  try {
    const { area } = req.query;
    const match = area
      ? { restaurant_area: area, traffic_density: { $in: TRAFFIC_ORDER } }
      : { traffic_density: { $in: TRAFFIC_ORDER } };

    const data = await Delivery.aggregate([
      { $match: match },
      {
        $group: {
          _id:       '$traffic_density',
          avg_delay: { $avg: '$delay_mins' },
          count:     { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          traffic:   '$_id',
          avg_delay: { $round: ['$avg_delay', 2] },
          count: 1,
        },
      },
    ]);

    // Sort by natural severity order
    data.sort((a, b) => TRAFFIC_ORDER.indexOf(a.traffic) - TRAFFIC_ORDER.indexOf(b.traffic));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
