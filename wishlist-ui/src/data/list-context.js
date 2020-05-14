import React, { useState, useContext, useEffect, createContext, useCallback } from 'react';
import { Auth0Context } from '../auth0';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-regular-svg-icons';
import Loading from '../components/loading';
import { okCheck } from '../utils/fetch';

import config from '../config.json';
import { Redirect } from 'react-router';

export const ListContext = createContext();

export const ListProvider = ({ wishlistId, children, loadingAs }) => {
  const [list, setList] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [redirectToRoot, setRedirectToRoot] = useState(false);

  const auth0Context = useContext(Auth0Context);

  /**
   * Queries the backend service for a list of wishlists associated with the logged in user.
   */
  const getList = useCallback(() => {
    return fetch(`${config.apiBaseUrl}/wishlists/${wishlistId}`)
      .then(res => okCheck(res, `Unable to load list with ID ${wishlistId}`))
      .then(res => res.json())
      .then(res => setList(res));
  }, [wishlistId]);

  /**
   * Queries the backend service for a list of items belonging to the current list.
   */
  const getItems = useCallback(() => {
    return fetch(`${config.apiBaseUrl}/wishlists/${wishlistId}/items`)
      .then(res => okCheck(res, `Unable to load list items for list ID ${wishlistId}`))
      .then(res => res.json())
      .then(res => setItems(res));
  }, [wishlistId]);

  const isCurrentUserOwner = () => {
    if (auth0Context.loading || !auth0Context.isAuthenticated) {
      return false;
    }
    return auth0Context.user.email === list.owner;
  };

  /**
   * Updates the list with the given ID with the given properties.
   */
  const updateList = (id, data) => {
    data.id = id;

    return auth0Context
      .getTokenSilently()
      .then(token => {
        return fetch(`${config.apiBaseUrl}/wishlists/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      })
      .then(res => okCheck(res, `Unable to update list ${id}`))
      .then(res => res.json())
      .then(res => {
        setList(res);
      });
  };

  /**
   * Deletes the list with the given ID.
   */
  const deleteList = id => {
    return auth0Context
      .getTokenSilently()
      .then(token => {
        return fetch(`${config.apiBaseUrl}/wishlists/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then(res => okCheck(res, `Unable to delete list ${id}`))
      .then(() => {
        setList(null);
        setRedirectToRoot(true);
      });
  };

  /**
   * Adds an item to the list.
   *
   * @param {*} data
   */
  const addItem = data => {
    return auth0Context
      .getTokenSilently()
      .then(token => {
        return fetch(`${config.apiBaseUrl}/wishlists/${wishlistId}/items`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: data.description,
            url: data.url || null,
            price: data.price || null,
          }),
        });
      })
      .then(res => okCheck(res, `Unable to add item to list ${wishlistId}`))
      .then(res => res.json())
      .then(res => {
        setItems([...items, res]);
      });
  };

  /**
   * Updates a specific item in the list.
   *
   * @param {*} id
   * @param {*} data
   */
  const updateItem = (id, data) => {
    return auth0Context
      .getTokenSilently()
      .then(token => {
        return fetch(`${config.apiBaseUrl}/wishlists/${wishlistId}/items/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: data.description,
            url: data.url || null,
            price: data.price || null,
          }),
        });
      })
      .then(res => okCheck(res, `Unable to update item ${id} in list ${wishlistId}`))
      .then(res => res.json())
      .then(res => {
        items[items.findIndex(it => it.id === id)] = res;
        setItems([...items]);
      });
  };

  /**
   * Removes an item from the list.
   *
   * @param {*} id
   */
  const removeItem = id => {
    return auth0Context
      .getTokenSilently()
      .then(token => {
        return fetch(`${config.apiBaseUrl}/wishlists/${wishlistId}/items/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      })
      .then(res => okCheck(res, `Unable to delete item ${id} from list ${wishlistId}`))
      .then(() => {
        setItems(items.filter(item => item.id !== id));
      });
  };

  useEffect(() => {
    if (!auth0Context.loading) {
      getList()
        .then(getItems)
        .catch(err => {
          console.error(err);
          setUnavailable(true);
        })
        .then(() => setLoading(false));
    }
  }, [auth0Context.loading, auth0Context.isAuthenticated, getItems, getList]);

  if (loading) {
    return loadingAs ? loadingAs : <Loading />;
  } else if (redirectToRoot) {
    return <Redirect to="/" />;
  } else if (unavailable) {
    // TODO: actually make an unavailable page
    return 'The service is unavailable.';
  } else if (!list) {
    return (
      <div className="text-center">
        <p style={{ fontSize: '10rem' }}>
          <FontAwesomeIcon icon={faFrown} />
        </p>
        <h3>Wish List Not Found</h3>
      </div>
    );
  } else {
    return (
      <ListContext.Provider
        value={{
          list,
          items,
          updateList,
          deleteList,
          addItem,
          updateItem,
          removeItem,
          isCurrentUserOwner,
          setRedirectToRoot,
        }}
      >
        {children}
      </ListContext.Provider>
    );
  }
};
