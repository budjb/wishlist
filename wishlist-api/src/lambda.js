const { createServer, proxy } = require('aws-serverless-express');

exports.handler = (event, context) => {
  const app = require('./app')({ useAwsMiddleware: true });
  proxy(createServer(app), event, context);
};
