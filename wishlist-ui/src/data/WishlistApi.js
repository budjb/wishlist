import React, { createContext, useEffect, useState, useContext } from 'react';
import {v4 as uuidv4} from 'uuid';
import { Auth0Context } from '../Auth0';
import _ from 'lodash';
import config from '../config.json';

const localStorageKey = "__wishlist_items";

export const WishlistApiContext = createContext();

export const WishlistApiProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [lists, setLists] = useState([]);

  const auth0Context = useContext(Auth0Context);

  const pushLocalStorage = () => {
    localStorage.setItem(localStorageKey, JSON.stringify(lists));
    setIsLoading(true);
  };

  const addList = name => {
    lists.push({
      id: uuidv4(),
      name,
      owner: auth0Context.user.email
    });
    pushLocalStorage();
  };

  const deleteList = id => {
    _.remove(lists, it => it.id === id)
    pushLocalStorage();
  };

  const getList = id => {
    return lists.find(it => it.id === id);
  };

  const removeItem = (listId, itemId) => {
    const list = getList(listId);

    if (!list) {
      return;
    }

    const items = list.items;

    if (!items) {
      return;
    }

    _.remove(items, it => it.id === itemId);
    pushLocalStorage();
  };

  const addItem = (listId, item) => {
    const list = getList(listId);

    if (!list) {
      return;
    }

    if (!list.items) {
      list.items = [];
    }

    list.items.push(item);

    pushLocalStorage();
  };

  const getItems = (listId) => {
    const list = getList(listId);

    if (!list) {
      return [];
    }

    return list.items || [];
  };

  const updateItem = (listId, updated) => {
    const list = getList(listId);

    if (!list) {
      return;
    }

    const items = list.items;

    if (!items) {
      return;
    }

    const previous = items.find(it => it.id === updated.id);

    if (!previous) {
      return;
    }

    previous.description = updated.description;
    previous.url = updated.url;
    previous.price = updated.price;

    pushLocalStorage();
  };

  const renameList = (id, name) => {
    const list = getList(id);
    list.name = name;
    pushLocalStorage();
  };

  useEffect(() => {
    if (isLoading) {
      if (localStorage.getItem(localStorageKey)) {
        setLists(JSON.parse(localStorage.getItem(localStorageKey)));
      }
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <WishlistApiContext.Provider value={{
      isLoading,
      lists,
      addList,
      deleteList,
      getList,
      getItems,
      addItem,
      removeItem,
      updateItem,
      renameList
    }}>
      {children}
    </WishlistApiContext.Provider>
  )
};

export const getLists = (token) => {
  return fetch(
    `${config.apiBaseUrl}/wishlists`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).then(res => res.json());
}

export const createList = (token, name) => {
  return fetch(
    `${config.apiBaseUrl}/wishlists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: name})
    }
  ).then(res => res.json());
};
