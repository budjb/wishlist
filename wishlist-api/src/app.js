const express = require('express');
const cors = require('cors');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { routes } = require('./controller');

const app = ({ useAwsMiddleware = false }) => {
  const app = express();

  if (useAwsMiddleware) {
    app.use(awsServerlessExpressMiddleware.eventContext());
  }

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

    res.status(500).json(json);
  });

  return app;
};

module.exports = app;
