import { createServer, proxy } from 'aws-serverless-express';
import app from './app.js';

const handler = (event, context) => {
  const instance = app({ useAwsMiddleware: true });
  proxy(createServer(instance), event, context);
};

export default { handler };
