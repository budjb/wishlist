import React, { useState, useContext } from 'react';
import { Button, Dropdown, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faPlus } from '@fortawesome/free-solid-svg-icons';

import AddListModal from '../../components/add-list-modal';
import DeleteListModal from '../../components/delete-list-modal';
import EditListModal from '../../components/edit-list-modal';

import { Link } from 'react-router-dom';
import { ListsContext, ListsProvider } from '../../data/lists-context';

const GettingStarted = () => {
  const [isAddModalShown, setIsAddModalShown] = useState(false);
  const context = useContext(ListsContext);

  return (
    <div className="jumbotron">
      <AddListModal isShown={isAddModalShown} close={() => setIsAddModalShown(false)} addList={context.createList} />
      <h1>Get Started</h1>
      <p>You don't have any wishlists yet! Click the button below to get started and create your first wishlist.</p>
      <Button onClick={() => setIsAddModalShown(true)}>Get Started</Button>
    </div>
  );
};

const Actions = () => {
  const [isAddModalShown, setIsAddModalShown] = useState(false);
  const context = useContext(ListsContext);

  return (
    <>
      <AddListModal isShown={isAddModalShown} close={() => setIsAddModalShown(false)} addList={context.createList} />
      <div className="cursor-pointer px-2 text-muted-hover" onClick={() => setIsAddModalShown(true)}>
        <FontAwesomeIcon icon={faPlus} />
      </div>
    </>
  );
};

const ListActions = ({ list }) => {
  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
  const [isEditModalShown, setIsEditModalShown] = useState(false);
  const context = useContext(ListsContext);

  return (
    <>
      <EditListModal
        list={list}
        isShown={isEditModalShown}
        close={() => setIsEditModalShown(false)}
        updateList={context.updateList}
      />
      <DeleteListModal
        list={list}
        isShown={isDeleteModalShown}
        close={() => setIsDeleteModalShown(false)}
        deleteList={context.deleteList}
      />
      <Dropdown>
        <Dropdown.Toggle as="div" bsPrefix="actions-dropdown" className="cursor-pointer text-muted-hover px-2">
          <FontAwesomeIcon icon={faEllipsisV} />
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>
          <Dropdown.Item eventKey="1" onClick={() => setIsEditModalShown(true)}>
            Rename
          </Dropdown.Item>
          <Dropdown.Item className="text-danger" onClick={() => setIsDeleteModalShown(true)}>
            Delete
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

const LoadingList = () => {
  return (
    <div className="list-container">
      <div className="d-flex flex-row align-items-center">
        <div className="flex-grow-1">
          <div className="skeleton-item" style={{ height: '38px', width: '200px' }} />
        </div>
        <div className="skeleton-item mx-1" style={{ height: '24px', width: '24px' }} />
      </div>
      <ListGroup>
        <ListGroup.Item className="d-flex flex-row align-items-center">
          <div className="flex-grow-1 p-2 d-flex align-items-center">
            <div className="skeleton-item" style={{ height: '24px', width: '200px' }} />
          </div>
          <div className="skeleton-item mx-1" style={{ height: '24px', width: '24px' }} />
        </ListGroup.Item>
        <ListGroup.Item className="d-flex flex-row align-items-center">
          <div className="flex-grow-1 p-2 d-flex align-items-center">
            <div className="skeleton-item" style={{ height: '24px', width: '160px' }} />
          </div>
          <div className="skeleton-item mx-1" style={{ height: '24px', width: '24px' }} />
        </ListGroup.Item>
        <ListGroup.Item className="d-flex flex-row align-items-center">
          <div className="flex-grow-1 p-2 d-flex align-items-center">
            <div className="skeleton-item" style={{ height: '24px', width: '180px' }} />
          </div>
          <div className="skeleton-item mx-1" style={{ height: '24px', width: '24px' }} />
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
};

const List = () => {
  const { lists } = useContext(ListsContext);

  const rows = lists.map((it, i) => {
    return (
      <ListGroup.Item key={i} className="d-flex flex-row align-items-center lists-index">
        <Link key={i} to={`/${it.id}`} className="h4 mb-0 display-block flex-grow-1 p-md-2 list-link">
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
      <ListGroup>{rows}</ListGroup>
    </div>
  );
};

const ListIndex = () => {
  return (
    <ListsProvider loadingAs={<LoadingList />}>
      <ListsContext.Consumer>
        {({ lists }) => {
          return lists.length ? <List /> : <GettingStarted />;
        }}
      </ListsContext.Consumer>
    </ListsProvider>
  );
};

export default ListIndex;
