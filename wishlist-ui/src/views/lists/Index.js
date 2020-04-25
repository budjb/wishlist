import React, { useState, useContext, useEffect, createContext } from 'react';
import { Jumbotron, Button, Dropdown, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faPlus } from '@fortawesome/free-solid-svg-icons';

import AddListModal from '../../components/AddListModal';
import DeleteListModal from '../../components/DeleteListModal';
import EditListModal from '../../components/EditListModal';

import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';

import { WishlistApiContext, getLists, createList } from '../../data/WishlistApi';
import { Auth0Context } from '../../Auth0';

import './Index.css';

const ListsContext = createContext();

const GettingStarted = () => {
  const [isAddModalShown, setIsAddModalShown] = useState(false);
  const context = useContext(ListsContext);

  return (
    <Jumbotron>
      <AddListModal isShown={isAddModalShown} close={() => setIsAddModalShown(false)} addList={context.createList} />
      <h1>Get Started</h1>
      <p>
        You don't have any wishlists yet! Click the button below to get started and create your first wishlist.
      </p>
      <Button onClick={() => setIsAddModalShown(true)}>Get Started</Button>
    </Jumbotron>
  );
};

const Actions = () => {
  const [isAddModalShown, setIsAddModalShown] = useState(false);
  const context = useContext(WishlistApiContext);

  return (
    <>
      <AddListModal isShown={isAddModalShown} close={() => setIsAddModalShown(false)} addList={context.addList} />
      <div className="cursor-pointer px-2 text-muted-hover" onClick={() => setIsAddModalShown(true)}>
        <FontAwesomeIcon icon={faPlus} />
      </div>
    </>
  )
};

const ListActions = ({ list }) => {
  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
  const [isEditModalShown, setIsEditModalShown] = useState(false);
  const context = useContext(WishlistApiContext);

  return (
    <>
      <EditListModal list={list} isShown={isEditModalShown} close={() => setIsEditModalShown(false)} saveList={context.renameList} />
      <DeleteListModal list={list} isShown={isDeleteModalShown} close={() => setIsDeleteModalShown(false)} deleteList={context.deleteList} />
      <Dropdown>
        <Dropdown.Toggle as="div" bsPrefix="actions-dropdown" className="cursor-pointer text-muted-hover px-2">
          <FontAwesomeIcon icon={faEllipsisV} />
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>
          <Dropdown.Item eventKey="1" onClick={() => setIsEditModalShown(true)}>Rename</Dropdown.Item>
          <Dropdown.Item className="text-danger" onClick={() => setIsDeleteModalShown(true)}>Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
};

const List = ({ lists }) => {
  const rows = lists.map((it, i) => {
    return (
      <ListGroup.Item key={i} className="d-flex flex-row align-items-center">
        <Link key={i} to={`/${it.id}`} className="h4 mb-0 display-block flex-grow-1 p-2 list-link">
          {it.name}
        </Link>
        <ListActions list={it} />
      </ListGroup.Item>
    );
  });

  return (
    <div className="list-container">
      <div className="d-flex flex-row align-items-center">
        <h2 className="flex-grow-1">Your Wishlists</h2>
        <Actions />
      </div>
      <ListGroup>
        {rows}
      </ListGroup>
    </div>
  )
};

export default () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth0Context = useContext(Auth0Context);

  const _getLists = () => {
    return auth0Context.getTokenSilently()
      .then(token => getLists(token))
};

  const _createList = name => {
    return auth0Context.getTokenSilently()
      .then(token => createList(token, name))
      .catch(err => console.error(`Unable to load wishlists: ${err}`));
  };

  useEffect(() => {
    if (!auth0Context.loading && auth0Context.isAuthenticated) {
      _getLists().then(res => setLists(res))
        .then(() => setLoading(false))
        .catch(err => console.error(`Unable to load wishlists: ${err}`));
    }
  }, [auth0Context, auth0Context.loading, auth0Context.isAuthenticated]);

  if (loading) {
    return <Loading />;
  }

  const contextValue = {
    lists,
    createList: _createList
  };

  const content = lists.length ? (
    <List />
  ) : (
    <GettingStarted />
  );

  return (
    <ListsContext.Provider value={contextValue}>
      {content}
    </ListsContext.Provider>
  );
};
