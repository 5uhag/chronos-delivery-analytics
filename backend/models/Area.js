const mongoose = require('mongoose');

const AreaSchema = new mongoose.Schema({
  name:               { type: String },
  zone:               { type: String },
  avg_delay_mins:     { type: Number },
  peak_hour:          { type: Number },
  top_weather_factor: { type: String },
  order_count:        { type: Number },
});

module.exports = mongoose.model('Area', AreaSchema, 'areas');
