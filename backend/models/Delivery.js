const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  order_id:             { type: String },
  restaurant_area:      { type: String },
  delivery_area:        { type: String },
  distance_km:          { type: Number },
  order_time:           { type: String },
  order_hour:           { type: Number },
  day_of_week:          { type: String },
  weather:              { type: String },
  traffic_density:      { type: String },
  delivery_time_mins:   { type: Number },
  estimated_time_mins:  { type: Number },
  delay_mins:           { type: Number },
  created_at:           { type: Date, default: Date.now },
});

module.exports = mongoose.model('Delivery', DeliverySchema, 'deliveries');
