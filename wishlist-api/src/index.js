const express = require('express');
const cors = require('cors');
const { routes } = require('./controller');

const app = express();

app.use(cors());

app.use(routes());

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name == 'UnauthorizedError') {
    res.json(401, { error: 'authorization header required' });
    return;
  }

  const json = {
    error: 'Internal Server Error',
  };

  if (process.env.STAGE != 'prod') {
    json.message = err.message;
    json.stack = err.stack;
  }

  res.status(500).json(json);
});

app.listen(8000);
console.log('Wishlist RESTful API server started on port 8000');
