const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');
const helmet = require('helmet');

const app = express();

app.use(cors());
// app.use(helmet())

const agent = new https.Agent({
  rejectUnauthorized: false,
});

app.get('*', async (req, res) => {
  try {
    const { headers, originalUrl } = req;

    const url = originalUrl.substring(1);

    console.log(url, headers);
    const { data, status } = await axios.get(decodeURIComponent(originalUrl.substring(1)), {
      headers,
      httpsAgent: agent,
    });
    console.log(status, data);

    return res.status(status).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
});

module.exports = app;
