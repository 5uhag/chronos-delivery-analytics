const router = require('express').Router();
const Area = require('../models/Area');

// GET /api/areas
router.get('/', async (req, res) => {
  try {
    const areas = await Area.find().sort({ avg_delay_mins: -1 }).lean();
    res.json(areas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
