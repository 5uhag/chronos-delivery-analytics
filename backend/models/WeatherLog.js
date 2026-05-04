const mongoose = require('mongoose');

const WeatherLogSchema = new mongoose.Schema({
  area:           { type: String },
  date:           { type: Date },
  condition:      { type: String },
  avg_delay_mins: { type: Number },
  order_count:    { type: Number },
});

module.exports = mongoose.model('WeatherLog', WeatherLogSchema, 'weather_logs');
