const app = require('./app')({ useAwsMiddleware: false });
app.listen(8000);
console.log('Wishlist RESTful API server started on port 8000');
