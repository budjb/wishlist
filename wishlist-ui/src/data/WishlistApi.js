import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const WishlistApiContext = createContext();

const mockItems = [
  {
    id: "e7751fa7-e1ab-478f-bf6f-71076b1a1eba",
    description: "foo",
    price: 123.45
  },
  {
    id: "9e331644-93a3-4f3c-9868-3337a5effc5f",
    description: "Gift Cards (anywhere really)",
    price: "Any"
  }
]

export default ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setItems(mockItems);
    setIsLoading(false);
  }, []);

  /**
   * TODO: actually call the API
   * 
   * @param {*} id 
   */
  const removeItem = id => {
    setItems(items.filter(it => it.id !== id));
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

    // Force re-render
    setItems([...items]);
  };

  const addItem = (description, url, price) => {
    const newItem = {
      id: uuidv4(),
      description,
      url,
      price
    }
    setItems([...items, newItem])
  };

  const providerValue = {
    items,
    isLoading,
    removeItem,
    updateItem,
    addItem
  };

  return (
    <WishlistApiContext.Provider value={providerValue}>
      {children}
    </WishlistApiContext.Provider>
  )
};
