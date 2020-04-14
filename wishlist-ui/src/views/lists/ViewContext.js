import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { WishlistApiContext } from '../../data/WishlistApi';
import { Auth0Context } from '../../Auth0';

export const Context = createContext();

export const Provider = ({ listId, children }) => {
  const [notFound, setNotFound] = useState(false);
  const [items, setItems] = useState([]);
  const [list, setList] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const wishlistApiContext = useContext(WishlistApiContext);
  const auth0Context = useContext(Auth0Context);

  const load = useCallback(() => {
    if (auth0Context.loading || wishlistApiContext.isLoading) {
      return;
    }

    const list = wishlistApiContext.getList(listId);

    if (!list) {
      setNotFound(true);
    } else {
      setList(list);
      setItems(wishlistApiContext.getItems(listId));
    }
    setIsLoading(false)
  }, [auth0Context, wishlistApiContext, listId]);

  useEffect(() => {
    if (!wishlistApiContext.isLoading) {
      load();
    }
  }, [wishlistApiContext.isLoading, load]);

  const removeItem = id => {
    wishlistApiContext.removeItem(listId, id);
  };

  const updateItem = (id, description, url, price) => {
    const item = items.find(it => it.id === id);

    if (!item) {
      console.error(`Item with id ${id} not found`);
      return;
    }

    item.description = description;
    item.url = url;
    item.price = price;

    wishlistApiContext.updateItem(listId, item);
  };

  const addItem = (description, url, price) => {
    wishlistApiContext.addItem(listId, {
      id: uuidv4(),
      description,
      url,
      price
    });
  };

  const isCurrentUserOwner = () => {
    if (notFound || isLoading || auth0Context.loading || !auth0Context.isAuthenticated) {
      return false;
    }

    return auth0Context.user.email === list.owner;
  };

  const providerValue = {
    list,
    items,
    removeItem,
    updateItem,
    addItem,
    notFound,
    isCurrentUserOwner,
    currentUser: auth0Context.user,
    isLoading,
    renameList: wishlistApiContext.renameList,
    deleteList: wishlistApiContext.deleteList
  };

  return (
    <Context.Provider value={providerValue}>
      {children}
    </Context.Provider>
  )
};
