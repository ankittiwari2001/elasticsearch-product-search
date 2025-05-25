// server.js
const express = require('express');
const client = require('./elastic');
const app = express();
const PORT = 3000;

app.get('/search', async (req, res) => {
  const query = req.query.query || '';
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;

  const from = (page - 1) * size;

  try {
    const result = await client.search({
      index: 'products',
      from,
      size,
      query: {
        multi_match: {
          query,
          fields: ['name', 'description', 'category'],
          fuzziness: 'AUTO',
        },
      },
    });

    res.json({
      total: result.hits.total.value,
      results: result.hits.hits.map((hit) => hit._source),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Search failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
