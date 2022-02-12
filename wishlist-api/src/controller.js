import express from 'express';
import { requireAccessToken } from './auth0.js';
import Joi from '@hapi/joi';
import * as client from './client.js';

/**
 * Wishlist schema.
 */
const listSchema = Joi.object({
  name: Joi.string().required(),
}).options({ stripUnknown: true });

/**
 * Item schema.
 */
const itemSchema = Joi.object({
  description: Joi.string().required().empty(),
  url: Joi.string().optional().allow(null).uri(),
  price: Joi.string().optional().allow(null),
});

/**
 * Returns a list of wishlists owned by the authenticated user.
 *
 * @param {*} req
 * @param {*} res
 */
const getLists = (req, res) => {
  return client
    .getLists(req.profile.email)
    .then(data => {
      return res.json(data);
    })
    .catch(err => {
      console.error(`error retrieving a list of wishlists: ${err}`);
      return res.status(500).json({ error: err });
    });
};

/**
 * Returns a specified list if it exists.
 *
 * @param {*} _req
 * @param {*} res
 */
const getList = (req, res) => {
  const id = req.params.wishlistId;

  return client
    .getList(id)
    .then(data => {
      return res.json(data);
    })
    .catch(err => {
      console.error(`error retrieving wishlist with ID ${id}: ${err}`);
      return res.status(500).json({ error: err });
    });
};

/**
 * Creates a new list owned by the authenticated user.
 *
 * @param {*} req
 * @param {*} res
 */
const createList = (req, res) => {
  const result = listSchema.validate(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error.details.map(it => it.message) });
  }

  const name = result.value.name;
  const owner = req.profile.email;

  return client
    .createList(name, owner)
    .then(data => {
      return res.status(201).json(data);
    })
    .catch(err => {
      console.error(`error creating a wishlist: ${err}`);
      return res.status(500).json({ error: err });
    });
};

/**
 * Updates a list with new properties.
 *
 * @param {*} req
 * @param {*} res
 */
const updateList = (req, res) => {
  const id = req.params.wishlistId;
  const owner = req.profile.email;

  const result = listSchema.validate(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error.details.map(it => it.message) });
  }

  const name = result.value.name;

  return client
    .updateList(id, name, owner)
    .then(data => {
      return res.json(data);
    })
    .catch(err => {
      console.error(`error updating wishlist ${id}: ${err}`);
      return res.status(500).json({ error: err });
    });
};

/**
 * Deletes a list and any items associated with it.
 *
 * @param {*} req
 * @param {*} res
 */
const deleteList = (req, res) => {
  const id = req.params.wishlistId;
  const owner = req.profile.email;

  return client
    .deleteList(id, owner)
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      console.error(`error deleting wishlist ${id}: ${err}`);
      return res.status(500).json({ error: err });
    });
};

/**
 * Returns a list of items associated with the given wishlist ID.
 *
 * @param {*} req
 * @param {*} res
 */
const getItems = (req, res) => {
  const id = req.params.wishlistId;

  return client
    .getItems(id)
    .then(data => {
      return res.json(data);
    })
    .catch(err => {
      console.error(`error retrieving a items for wishlist ${id}: ${err}`);
      return res.status(500).json({ error: err });
    });
};

/**
 * Updates an item.
 *
 * @param {*} req
 * @param {*} res
 */
const updateItem = (req, res) => {
  const wishlistId = req.params.wishlistId;
  const itemId = req.params.itemId;
  const owner = req.profile.email;

  const result = itemSchema.validate(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error.details.map(it => it.message) });
  }

  const description = result.value.description;
  const url = result.value.url;
  const price = result.value.price;

  return client
    .updateItem(wishlistId, itemId, owner, description, url, price)
    .then(data => {
      return res.json(data);
    })
    .catch(err => {
      if (err instanceof client.AccessDeniedError) {
        res.status(403);
      } else {
        console.error(`error updating item ${itemId} in wishlist ${wishlistId}: ${err}`);
        res.status(500);
      }
      return res.json({ error: err });
    });
};

const deleteItem = (req, res) => {
  const wishlistId = req.params.wishlistId;
  const itemId = req.params.itemId;
  const owner = req.profile.email;

  client
    .deleteItem(wishlistId, itemId, owner)
    .then(() => {
      return res.status(204).end();
    })
    .catch(err => {
      if (err instanceof client.AccessDeniedError) {
        res.status(403);
      } else {
        console.error(`error deleting item ${itemId} in wishlist ${wishlistId}: ${err}`);
        res.status(500);
      }
      return res.json({ error: err });
    });
};

const createItem = (req, res) => {
  const wishlistId = req.params.wishlistId;

  const result = itemSchema.validate(req.body);

  if (result.error) {
    return res.status(400).json({ error: result.error.details.map(it => it.message) });
  }

  const description = result.value.description;
  const url = result.value.url;
  const price = result.value.price;

  const owner = req.profile.email;

  return client
    .createItem(wishlistId, owner, description, url, price)
    .then(data => {
      return res.status(201).json(data);
    })
    .catch(err => {
      if (err instanceof client.AccessDeniedError) {
        res.status(403);
      } else {
        console.error(`error adding an item to wishlist ${wishlistId}: ${err}`);
        res.status(500);
      }
      return res.json({ error: err });
    });
};

export const routes = () => {
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
