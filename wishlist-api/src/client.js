import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import config from './config.json' assert { type: 'json' };

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();

export class AccessDeniedError extends Error {}

export const getLists = owner => {
  const params = {
    TableName: config.dynamoDbTable,
    KeyConditionExpression: 'pk = :owner AND begins_with(sk, :prefix)',
    ExpressionAttributeValues: {
      ':owner': {
        S: owner,
      },
      ':prefix': {
        S: 'wishlist_',
      },
    },
  };

  return dynamodb
    .query(params)
    .promise()
    .then(data => {
      return data.Items.map(it => {
        return {
          id: it.sk.S.split('_')[1],
          name: it.name.S,
          owner: it.pk.S,
        };
      });
    });
};

export const getList = id => {
  const params = {
    TableName: config.dynamoDbTable,
    IndexName: 'wishlist_id',
    KeyConditionExpression: 'sk = :prefix',
    ExpressionAttributeValues: {
      ':prefix': {
        S: `wishlist_${id}`,
      },
    },
  };

  return dynamodb
    .query(params)
    .promise()
    .then(data => {
      if (!data.Items.length) {
        return null;
      }

      const item = data.Items[0];

      return {
        id: item.sk.S.split('_')[1],
        name: item.name.S,
        owner: item.pk.S,
      };
    });
};

export const createList = (name, owner) => {
  const id = crypto.createHash('md5').update(uuidv4()).digest('hex');

  const params = {
    TableName: config.dynamoDbTable,
    Item: {
      pk: {
        S: owner,
      },
      sk: {
        S: `wishlist_${id}`,
      },
      name: {
        S: name,
      },
    },
  };

  return dynamodb
    .putItem(params)
    .promise()
    .then(() => {
      return {
        id,
        name,
        owner,
      };
    });
};

export const updateList = (id, name, owner) => {
  const params = {
    TableName: config.dynamoDbTable,
    Key: {
      pk: {
        S: owner,
      },
      sk: {
        S: `wishlist_${id}`,
      },
    },
    UpdateExpression: 'set #name = :name',
    ExpressionAttributeValues: {
      ':name': {
        S: name,
      },
    },
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ReturnValues: 'ALL_NEW',
  };

  return dynamodb
    .updateItem(params)
    .promise()
    .then(res => {
      const attributes = res.Attributes;

      return {
        id: attributes.sk.S.split('_')[1],
        name: attributes.name.S,
        owner: attributes.pk.S,
      };
    });
};

export const deleteList = (id, owner) => {
  const params = {
    TableName: config.dynamoDbTable,
    Key: {
      pk: {
        S: owner,
      },
      sk: {
        S: `wishlist_${id}`,
      },
    },
    ReturnValues: 'NONE',
  };

  return dynamodb
    .deleteItem(params)
    .promise()
    .then(() => {
      return getItems(id);
    })
    .then(items => {
      return Promise.all(
        items.map(item => {
          const params = {
            TableName: config.dynamoDbTable,
            Key: {
              pk: {
                S: `wishlist_${id}`,
              },
              sk: {
                S: `item_${item.id}`,
              },
            },
            ReturnValues: 'NONE',
          };

          return dynamodb.deleteItem(params).promise();
        }),
      );
    });
};

export const getItems = wishlistId => {
  const params = {
    TableName: config.dynamoDbTable,
    KeyConditionExpression: 'pk = :prefix',
    ExpressionAttributeValues: {
      ':prefix': {
        S: `wishlist_${wishlistId}`,
      },
    },
  };

  return dynamodb
    .query(params)
    .promise()
    .then(data => {
      return data.Items.map(it => {
        const id = it.sk.S.split('_')[1];
        const description = it.description.S;
        const url = it.url ? it.url.S : null;
        const price = it.price ? it.price.S : null;

        return {
          id,
          description,
          url,
          price,
        };
      });
    });
};

export const updateItem = async (wishlistId, itemId, owner, description, url, price) => {
  const listData = await getList(wishlistId);

  if (listData.owner !== owner) {
    throw AccessDeniedError('You do not own the requested list');
  }

  const updates = {
    description: {
      Action: 'PUT',
      Value: {
        S: description,
      },
    },
  };

  if (url) {
    updates.url = {
      Action: 'PUT',
      Value: {
        S: url,
      },
    };
  } else {
    updates.url = {
      Action: 'DELETE',
    };
  }

  if (price) {
    updates.price = {
      Action: 'PUT',
      Value: {
        S: price,
      },
    };
  } else {
    updates.price = {
      Action: 'DELETE',
    };
  }

  const params = {
    TableName: config.dynamoDbTable,
    Key: {
      pk: {
        S: `wishlist_${wishlistId}`,
      },
      sk: {
        S: `item_${itemId}`,
      },
    },
    AttributeUpdates: updates,
  };

  return dynamodb
    .updateItem(params)
    .promise()
    .then(() => {
      return {
        id: itemId,
        description,
        url,
        price,
      };
    });
};

export const createItem = async (wishlistId, owner, description, url, price) => {
  const listData = await getList(wishlistId);

  if (listData.owner !== owner) {
    throw AccessDeniedError('You do not own the requested list');
  }

  const id = crypto.createHash('md5').update(uuidv4()).digest('hex');

  const items = {
    pk: {
      S: `wishlist_${wishlistId}`,
    },
    sk: {
      S: `item_${id}`,
    },
    description: {
      S: description,
    },
  };

  if (url) {
    items.url = {
      S: url,
    };
  }

  if (price) {
    items.price = {
      S: price,
    };
  }

  const params = {
    TableName: config.dynamoDbTable,
    Item: items,
  };

  return dynamodb
    .putItem(params)
    .promise()
    .then(() => {
      return {
        id,
        description,
        url,
        price,
      };
    });
};

export const deleteItem = async (wishlistId, itemId, owner) => {
  const listData = await getList(wishlistId);

  if (listData.owner !== owner) {
    throw AccessDeniedError('You do not own the requested list');
  }

  const params = {
    TableName: config.dynamoDbTable,
    Key: {
      pk: {
        S: `wishlist_${wishlistId}`,
      },
      sk: {
        S: `item_${itemId}`,
      },
    },
    ReturnValues: 'NONE',
  };

  return dynamodb.deleteItem(params).promise();
};
