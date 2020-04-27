const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const fetch = require('node-fetch');

const requireAccessToken = [
  jwt({
    secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://budjb-wishlist.auth0.com/.well-known/jwks.json',
    }),
    audience: 'https://api.wishlist.budjb.com',
    issuer: 'https://budjb-wishlist.auth0.com/',
    algorithms: ['RS256'],
  }),
  (req, _res, next) => {
    fetch('https://budjb-wishlist.auth0.com/userinfo', {
      headers: {
        Authorization: req.header('Authorization'),
      },
    })
      .then(res => res.json())
      .then(res => {
        req.profile = res;
      })
      .then(() => next());
  },
];

module.exports = {
  requireAccessToken,
};
