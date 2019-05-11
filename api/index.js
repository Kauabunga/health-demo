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
  const { headers, originalUrl } = req;
  const { authorization, apikey, accept } = headers;
  const filteredHeaders = { authorization, apikey, accept };
  const url = decodeURIComponent(originalUrl.substring(1));
  try {
    console.log(url, headers);
    const { data, status } = await axios.get(url, {
      headers: filteredHeaders,
      // httpsAgent: agent,
    });

    console.log(status, data);

    return res.status(status).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
      headers: filteredHeaders,
      url,
    });
  }
});

module.exports = app;
