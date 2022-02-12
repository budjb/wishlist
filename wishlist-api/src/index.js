import app from './app.js';

const instance = app({ useAwsMiddleware: false });
instance.listen(8000);
console.log('Wishlist RESTful API server started on port 8000');
