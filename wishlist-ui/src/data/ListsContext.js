
import React, { useState, useContext, useEffect, createContext, useCallback } from 'react';
import { Auth0Context } from '../Auth0';
import config from '../config.json';

import Loading from '../components/Loading';
import { okCheck } from '../utils/fetch';

export const ListsContext = createContext();

export const ListsProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const auth0Context = useContext(Auth0Context);

  /**
   * Queries the backend service for a list of wishlists associated with the logged in user.
   */
  const getLists = useCallback(() => {
    return auth0Context.getTokenSilently()
      .then(token => {
        return fetch(
          `${config.apiBaseUrl}/wishlists`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      })
      .then(res => okCheck(res, `Unable to load lists`))
      .then(res => res.json())
      .then(res => setLists(res));
  }, [auth0Context]);

  /**
   * Creates a new list belonging to the logged in user.
   */
  const createList = name => {
    return auth0Context.getTokenSilently()
      .then(token => {
        return fetch(
          `${config.apiBaseUrl}/wishlists`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name })
          }
        )
      })
      .then(res => okCheck(res, `Unable to create new list ${name}`))
      .then(res => res.json())
      .then(res => {
        setLists([...lists, res]);
      })
  };

  /**
   * Updates the list with the given ID with the given properties.
   */
  const updateList = (id, data) => {
    data.id = id;

    return auth0Context.getTokenSilently()
      .then(token => {
        return fetch(
          `${config.apiBaseUrl}/wishlists/${id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          }
        )
      })
      .then(res => okCheck(res, `Unable to update list ${id}`))
      .then(res => res.json())
      .then(res => {
        const idx = lists.findIndex(it => it.id === id);
        lists[idx] = res;
        setLists([...lists]); // force state update with updated item
      });
  };

  /**
   * Deletes the list with the given ID.
   */
  const deleteList = id => {
    return auth0Context.getTokenSilently()
      .then(token => {
        return fetch(
          `${config.apiBaseUrl}/wishlists/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      })
      .then(res => okCheck(res, `Unable to delete list ${id}`))
      .then(() => {
        setLists([...lists.filter(it => it.id !== id)]);
      });
  };

  useEffect(() => {
    if (!auth0Context.loading && auth0Context.isAuthenticated) {
      getLists()
        .catch(err => {
          console.error(err);
          setUnavailable(true);
        })
        .then(() => setLoading(false))
    }
  }, [getLists, auth0Context]);

  if (loading) {
    return <Loading />;
  } else if (unavailable) {
    // TODO: actually make an unavailable page
    return "The service is unavailable.";
  } else {
    return (
      <ListsContext.Provider value={{
        lists,
        createList,
        updateList,
        deleteList
      }}>
        {children}
      </ListsContext.Provider>
    );
  }
};
