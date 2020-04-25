const express = require('express');
const { requireAccessToken } = require('./auth0');
const Joi = require('@hapi/joi');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const config = require('./config.json');

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();

/**
 * Create wishlist schema.
 */
const createListSchema = Joi.object({
  name: Joi.string().required()
}).options({ stripUnknown: true });

/**
 * Returns a list of wishlists owned by the authenticated user.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const getLists = (req, res) => {
  const owner = req.profile.email;

  const params = {
    TableName: config.dynamoDbTable,
    KeyConditionExpression: 'pk = :owner AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: {
      ':owner': {
        'S': owner
      },
      ':prefix': {
        'S': 'wishlist_'
      }
    }
  };

  dynamodb.query(params).promise()
    .then(data => {
      return res.json(data.Items.map(it => {
        return {
          id: it.sk.S.split('_')[1],
          name: it.name.S,
          owner: it.pk.S
        }
      }));
    })
    .catch(err => {
      console.error(`error retrieving a list of wishlists: ${err}`);
      res.status(500).json({ error: err });
    });
};

/**
 * Returns a specified list if it exists.
 * 
 * @param {*} _req 
 * @param {*} res 
 */
const getList = (_req, res) => {
  const id = req.prams.wishlistId;

  const params = {
    TableName: config.dynamoDbTable,
    IndexName: 'wishlistId-index',
    KeyConditionExpression: 'wishlistId = :id',
    ExpressionAttributeValues: {
      ':wishlistId': {
        'S': `wishlist_${id}`
      }
    }
  };

  dynamodb.query(params).promise()
    .then(data => {
      if (!data.Items.length) {
        return res.status(404).json({ error: `wishlist with ID ${id} was not found` });
      }

      const item = data.Items[0];

      return res.json({
        id: item.sk.S.split('_')[1],
        name: item.name.S,
        owner: item.pk.S
      });
    })
    .catch(err => {
      console.error(`error retrieving wishlist with ID ${id}: ${err}`);
      res.status(500).json({ error: err });
    });
};

/**
 * Creates a new list owned by the authenticated user.
 * 
 * @param {*} req 
 * @param {*} res 
 */
const createList = (req, res) => {
  const result = createListSchema.validate(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error.details.map(it => it.message) });
  }

  const name = result.value.name;
  const owner = req.profile.email;
  const id = crypto.createHash('md5').update(uuidv4()).digest('hex');

  const params = {
    TableName: config.dynamoDbTable,
    Item: {
      'pk': {
        'S': owner
      },
      'sk': {
        'S': `wishlist_${id}`
      },
      'name': {
        'S': name
      }
    }
  }

  return dynamodb.putItem(params).promise()
    .then(data => {
      console.log(data);
    }).then(() => {
      return res.status(201).json({
        id,
        name,
        owner
      });
    })
    .catch(err => {
      console.error(`error creating a wishlist: ${err}`);
      res.status(500).json({ error: err });
    });
};

const updateList = (req, res) => {

};

const deleteList = (req, res) => {

};

const getItems = (req, res) => {

};

const updateItem = (req, res) => {

};

const deleteItem = (req, res) => {

};

const createItem = (req, res) => {

};

const routes = () => {
  const router = new express.Router();

  router.use(express.json());
  router.get('/wishlists', requireAccessToken, getLists);
  router.post('/wishlists', requireAccessToken, createList);
  router.get('/wishlists/:wishlistId', getList);
  router.put('/wishlists/:wishlistId', requireAccessToken, updateList);
  router.delete('/wishlists/:wishlistId', requireAccessToken, deleteList);

  router.get('/wishlists/:wishlistId/items', getItems);
  router.put('/wishlists/:wishlistId/items/:itemId', requireAccessToken, updateItem);
  router.delete('/wishlists/:wishlistId/items/:itemId', requireAccessToken, deleteItem);
  router.post('/wishlists/:wishlistId/items', requireAccessToken, createItem);

  return router;
};

module.exports = {
  routes
};
