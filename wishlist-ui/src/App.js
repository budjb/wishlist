import React, { useContext, useState, useEffect } from 'react';
import { Dropdown, Jumbotron, Button, Spinner, Table, Modal, Alert, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Auth0, {Auth0Context } from './Auth0';
import config from './config.json';

import './App.css';

import WishlistApi, { WishlistApiContext } from './data/WishlistApi';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

const currencyOrString = s => {
  if (s === '') {
    return <em>N/A</em>;
  }
  if (isNaN(s)) {
    return s;
  }
  return currencyFormatter.format(s);
};

const Welcome = () => {
  const [isAddModalShown, setIsAddModalShown] = useState(false);

  return (
    <Jumbotron>
      <AddItemModal isShown={isAddModalShown} close={() => setIsAddModalShown(false)}/>
      <h1>Get Started</h1>
      <p>
        You don't have any items in your wishlist yet. Get started by adding an item!
      </p>
      <Button onClick={() => setIsAddModalShown(true)}>Add An Item</Button>
    </Jumbotron>
  );
};

const ConfirmRemoveModal = ({ item, isShown, close }) => {
  const wishlistApiContext = useContext(WishlistApiContext);

  const removeItem = () => {
    wishlistApiContext.removeItem(item.id);
    close();
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to remove this item from the wishlist?</p>
        <Alert variant="secondary">{item.description}</Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button variant="primary" onClick={removeItem}>
          Remove Item
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const AddItemModal = ({ isShown, close }) => {
  const wishlistApiContext = useContext(WishlistApiContext);
  const [validated, setValidated] = useState(false);

  let descriptionRef, urlRef, priceRef;

  const updateItem = (event) => {
    const form = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
      setValidated(true);
    } else {
      wishlistApiContext.addItem(descriptionRef.value, urlRef.value, priceRef.value);
      close();
    }
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Form noValidate validated={validated} onSubmit={updateItem}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control ref={ref => descriptionRef = ref} type="text" placeholder="Item description..." required/>
            <Form.Control.Feedback type="invalid">
              Item description is required.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>URL</Form.Label>
            <Form.Control ref={ref => urlRef = ref} type="text" placeholder="(Optional) URL to item..."/>
          </Form.Group>
          <Form.Group>
            <Form.Label>Price</Form.Label>
            <Form.Control ref={ref => priceRef = ref} type="text" placeholder="(Optional) Item price..."/>
            <Form.Text className="text-muted">May be a number or plain text. Numbers will be formatted as currency.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const EditItemModal = ({ item, isShown, close }) => {
  const wishlistApiContext = useContext(WishlistApiContext);
  const [validated, setValidated] = useState(false);

  let descriptionRef, urlRef, priceRef;

  const updateItem = (event) => {
    const form = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
      setValidated(true);
    } else {
      wishlistApiContext.updateItem(item.id, descriptionRef.value, urlRef.value, priceRef.value);
      close();
    }
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Form noValidate validated={validated} onSubmit={updateItem}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control ref={ref => descriptionRef = ref} type="text" placeholder="Item description..."
              defaultValue={item.description} required/>
            <Form.Control.Feedback type="invalid">
              Item description is required.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>URL</Form.Label>
            <Form.Control ref={ref => urlRef = ref} type="text" placeholder="(Optional) URL to item..."
              defaultValue={item.url}/>
          </Form.Group>
          <Form.Group>
            <Form.Label>Price</Form.Label>
            <Form.Control ref={ref => priceRef = ref} type="text" placeholder="(Optional) Item price..."
              defaultValue={item.price}/>
            <Form.Text className="text-muted">May be a number or plain text. Numbers will be formatted as currency.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const ItemActions = ({ item }) => {
  const [isRemoveModalShown, setIsRemoveModalShown] = useState(false);
  const [isEditItemModalShow, setIsEditItemModalShown] = useState(false);

  return (
    <>
      <ConfirmRemoveModal item={item} isShown={isRemoveModalShown} close={() => setIsRemoveModalShown(false)}/>
      <EditItemModal item={item} isShown={isEditItemModalShow} close={() => setIsEditItemModalShown(false)}/>
      <Dropdown>
        <Dropdown.Toggle as="span" className="edit-button">
          <FontAwesomeIcon icon={faCog}/>
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>
          <Dropdown.Item eventKey="1" onClick={() => setIsEditItemModalShown(true)}>Edit</Dropdown.Item>
          <Dropdown.Item eventKey="2" className="text-danger" onClick={() => setIsRemoveModalShown(true)}>Remove</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
};

const ItemRow = ({ item, isEditing }) => {
  const description = item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.description}</a> : item.description;

  return (
    <tr>
      <td>{description}</td>
      <td className="text-right">{currencyOrString(item.price)}</td>
      <td className="fit">{ isEditing && <ItemActions item={item} /> }</td>
    </tr>
  );
};

const ListItems = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [isAddItemModalShown, setIsAddModalShown] = useState(false);

  const auth0Context = useContext(Auth0Context);
  const wishlistApiContext = useContext(WishlistApiContext);

  if (wishlistApiContext.isLoading) {
    return (
      <center><Spinner animation="border"/></center>
    );
  }
  
  if (!wishlistApiContext.items.length) {
    return <Welcome/>;
  }

  const rows = wishlistApiContext.items.map((it, idx) => <ItemRow key={idx} item={it} isEditing={isEditing}/>);

  const addItem = isEditing && (
    <>
      <AddItemModal isShown={isAddItemModalShown} close={() => setIsAddModalShown(false)}/>
      <span className="add-item-button" onClick={() => setIsAddModalShown(true)} title="Add Item...">
        <FontAwesomeIcon icon={faPlus}/>
        </span>
    </>
  );
  return (
    <>
      <div className="d-flex flex-row align-items-end">
        <div className="flex-grow-1">
          <h1 className="mb-0">Wishlist</h1>
          <h6 className="text-muted">{auth0Context.user.email}</h6>
        </div>
        <div className="mb-2">
          {addItem}
        </div>
      </div>
      <Table striped>
        <thead>
          <tr>
            <th>Description</th>
            <th className="text-right">Price</th>
            <th className="fit"/>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    </>
  )
};

const Secured = ({ children }) => {
  const { loading, isAuthenticated, loginWithRedirect } = useContext(Auth0Context);

  useEffect(() => {
    if (loading || isAuthenticated) {
      return;
    }
    const fn = async () => {
      await loginWithRedirect({appState: {targetUrl: window.location.pathname}});
    };
    fn();
  }, [loading, isAuthenticated, loginWithRedirect]);

  if (loading || !isAuthenticated) {
    return <div className="mt-5 text-center"><Spinner animation="border"/></div>
  } else {
    return children;
  }
};

const ToolBar = () => {
  const auth0Context = useContext(Auth0Context);
  const user = auth0Context.user;

  return (
    <div className="d-flex flex-row">
      <div className="flex-grow-1">budjb.wishlist.com</div>
      <Dropdown>
        <Dropdown.Toggle as="div" className="profile-button">
          <img alt="" src={user.picture}/>
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>
          <Dropdown.Header>
            <div className="text-body">{user.name}</div>
            <div className="text-muted">{user.email}</div>
          </Dropdown.Header>
          <Dropdown.Divider/>
          <Dropdown.Item eventKey="1" onClick={() => auth0Context.logout()}>Sign Out <FontAwesomeIcon icon={faSignOutAlt}/></Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default () => {
  return (
    <Auth0 domain={config.domain} client_id={config.clientId} redirect_uri={window.location.origin}>
      <Secured>
        <WishlistApi>
          <div className="d-flex flex-column h-100">
            <div className="text-left p-2" style={{background: "black", color: 'white'}}>
              <ToolBar/>
            </div>
            <div className="main-content p-4 mx-auto flex-fill flex-shrink-0 flex-grow-1">
              <ListItems/>
            </div>
          </div>
        </WishlistApi>
      </Secured>
    </Auth0>
  )
};
