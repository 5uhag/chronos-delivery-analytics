const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/deliveries',     require('./routes/deliveries'));
app.use('/api/areas',          require('./routes/areas'));
app.use('/api/weather-impact', require('./routes/weather'));
app.use('/api/time-analysis',  require('./routes/timeAnalysis'));
app.use('/api/stats',          require('./routes/stats'));

app.get('/', (req, res) => res.json({ status: 'Chronos API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Chronos API running on port ${PORT}`));
