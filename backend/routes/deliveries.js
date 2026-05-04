const router = require('express').Router();
const Delivery = require('../models/Delivery');

// GET /api/deliveries?area=&weather=&hour=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { area, weather, hour, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (area)    filter.restaurant_area  = area;
    if (weather) filter.weather          = weather;
    if (hour)    filter.order_hour       = Number(hour);

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Delivery.find(filter).skip(skip).limit(Number(limit)).lean(),
      Delivery.countDocuments(filter),
    ]);

    res.json({ total, page: Number(page), limit: Number(limit), data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
