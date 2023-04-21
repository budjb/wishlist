import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Dropdown, Button, Table, Modal, Alert, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEllipsisV, faShareAlt, faCopy, faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { faTwitterSquare, faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { ListContext, ListProvider } from '../../data/list-context';
import { FacebookShareButton, TwitterShareButton, EmailShareButton } from 'react-share';
import DeleteListModal from '../../components/delete-list-modal';
import EditListModal from '../../components/edit-list-modal';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const currencyOrString = s => {
  if (s === null || s === '') {
    return <em>N/A</em>;
  }

  if (isNaN(s)) {
    return s;
  }
  return currencyFormatter.format(s);
};

const ShareModal = ({ show, close }) => {
  const context = useContext(ListContext);

  if (navigator.share) {
    if (show) {
      navigator
        .share({
          url: window.location.href,
          title: context.list.description,
        })
        .then(() => close())
        .catch(() => close());
    }
    return '';
  }

  const copyUrlToClipboard = () => {
    var dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.setAttribute('value', window.location.href);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    close();
  };

  const shareUrl = window.location.href;
  const text = 'Check out my wishlist!';

  return (
    <Modal show={show} onHide={close} className="share-modal">
      <Modal.Header closeButton>
        <Modal.Title>Share Wishlist...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-row justify-content-around mb-3">
          <FacebookShareButton resetButtonStyle={false} url={shareUrl} quote={text} className="share-button facebook">
            <FontAwesomeIcon icon={faFacebookSquare} />
          </FacebookShareButton>
          <TwitterShareButton resetButtonStyle={false} url={shareUrl} title={text} className="share-button twitter">
            <FontAwesomeIcon icon={faTwitterSquare} />
          </TwitterShareButton>
          <EmailShareButton
            resetButtonStyle={false}
            subject={text}
            body={`Check out my wishlist! ${shareUrl}`}
            className="share-button email"
          >
            <FontAwesomeIcon icon={faEnvelopeSquare} />
          </EmailShareButton>
        </div>
        <InputGroup>
          <p className="copy-url">{shareUrl}</p>
          <InputGroup.Append>
            <Button variant="secondary" onClick={copyUrlToClipboard}>
              Copy <FontAwesomeIcon icon={faCopy} />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </Modal.Body>
    </Modal>
  );
};

const ConfirmRemoveModal = ({ item, isShown, close }) => {
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const context = useContext(ListContext);

  const removeItem = () => {
    if (busy) {
      return;
    }

    setBusy(true);
    context
      .removeItem(item.id)
      .then(() => {
        setBusy(false);
        setErrorMessage(undefined);
        close();
      })
      .catch(() => {
        setBusy(false);
        setErrorMessage('An unexpected error prevented the item from being removed from the list.');
      });
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <p>Are you sure you want to remove this item from the wishlist?</p>
        <Alert variant="secondary">{item.description}</Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button variant="primary" onClick={removeItem} disabled={busy}>
          Remove Item
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const AddItemModal = ({ isShown, close }) => {
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const context = useContext(ListContext);

  let descriptionRef, urlRef, priceRef;

  const updateItem = event => {
    const form = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
      setValidated(true);
    } else {
      setBusy(true);
      context
        .addItem({
          description: descriptionRef.value,
          url: urlRef.value,
          price: priceRef.value,
        })
        .then(() => {
          setBusy(false);
          setErrorMessage(undefined);
          close();
        })
        .catch(() => {
          setBusy(false);
          setErrorMessage('An unexpected error prevented the item from being added to the list.');
        });
    }
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Form noValidate validated={validated} onSubmit={updateItem}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control ref={ref => (descriptionRef = ref)} type="text" placeholder="Item description..." required />
            <Form.Control.Feedback type="invalid">Item description is required.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>URL</Form.Label>
            <Form.Control ref={ref => (urlRef = ref)} type="text" placeholder="(Optional) URL to item..." />
          </Form.Group>
          <Form.Group>
            <Form.Label>Price</Form.Label>
            <Form.Control ref={ref => (priceRef = ref)} type="text" placeholder="(Optional) Item price..." />
            <Form.Text className="text-muted">
              May be a number or plain text. Numbers will be formatted as currency.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={busy}>
            Save
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const EditItemModal = ({ item, isShown, close }) => {
  const context = useContext(ListContext);
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  let descriptionRef, urlRef, priceRef;

  const updateItem = event => {
    const form = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
      setValidated(true);
    } else {
      setBusy(true);
      context
        .updateItem(item.id, {
          description: descriptionRef.value,
          url: urlRef.value,
          price: priceRef.value,
        })
        .then(() => {
          setBusy(false);
          setErrorMessage(undefined);
          close();
        })
        .catch(() => {
          setBusy(false);
          setErrorMessage('An unexpected error prevented the item from being added to the list.');
        });
    }
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Form noValidate validated={validated} onSubmit={updateItem}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              ref={ref => (descriptionRef = ref)}
              type="text"
              placeholder="Item description..."
              defaultValue={item.description}
              required
            />
            <Form.Control.Feedback type="invalid">Item description is required.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>URL</Form.Label>
            <Form.Control
              ref={ref => (urlRef = ref)}
              type="text"
              placeholder="(Optional) URL to item..."
              defaultValue={item.url}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Price</Form.Label>
            <Form.Control
              ref={ref => (priceRef = ref)}
              type="text"
              placeholder="(Optional) Item price..."
              defaultValue={item.price}
            />
            <Form.Text className="text-muted">
              May be a number or plain text. Numbers will be formatted as currency.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={busy}>
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
      <ConfirmRemoveModal item={item} isShown={isRemoveModalShown} close={() => setIsRemoveModalShown(false)} />
      <EditItemModal item={item} isShown={isEditItemModalShow} close={() => setIsEditItemModalShown(false)} />
      <Dropdown>
        <Dropdown.Toggle as="span" className="edit-button px-2" bsPrefix="item-actions">
          <FontAwesomeIcon icon={faEllipsisV} />
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>
          <Dropdown.Item eventKey="1" onClick={() => setIsEditItemModalShown(true)}>
            Edit Item
          </Dropdown.Item>
          <Dropdown.Item eventKey="2" className="text-danger" onClick={() => setIsRemoveModalShown(true)}>
            Remove Item
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

const ItemRow = ({ item, isOwner }) => {
  const itemText = () => {
    if (item.url) {
      return (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.description}
        </a>
      );
    } else {
      return item.description;
    }
  };

  const description = itemText();

  return (
    <tr className="bg-white">
      <td>{description}</td>
      <td className="text-end">{currencyOrString(item.price)}</td>
      <td className="fit">{isOwner && <ItemActions item={item} />}</td>
    </tr>
  );
};

const EmptyList = ({ isOwner }) => {
  const [isAddModalShown, setIsAddModalShown] = useState(false);
  const context = useContext(ListContext);

  if (!isOwner) {
    return (
      <div className="jumbotron">
        <h1>Wish list is empty!</h1>
        <p className="m0">
          It looks like whoever created this wish list has all they could ever want! That, or they just haven't added
          anything to it. Probably the latter, but if not, maybe you should send them <em>your</em> wish list!
        </p>
      </div>
    );
  }
  return (
    <>
      <header className="d-flex flex-row align-items-center">
        <h2 className="flex-grow-1">{context.list.name}</h2>
        {isOwner && <ListActions />}
      </header>
      <div className="jumbotron">
        <AddItemModal isShown={isAddModalShown} close={() => setIsAddModalShown(false)} />
        <h1>Get Started</h1>
        <p>You don't have any items in your wishlist yet. Get started by adding an item!</p>
        <Button onClick={() => setIsAddModalShown(true)}>Add An Item</Button>
      </div>
    </>
  );
};

const LoadingList = () => {
  return (
    <div className="list-view">
      <header className="d-flex flex-row align-items-center" style={{ lineHeight: '1rem' }}>
        <div className="flex-grow-1">
          <div className="skeleton-item mb-2" style={{ height: '38px', width: '200px' }} />
        </div>
        <div className="skeleton-item mx-1" style={{ height: '24px', width: '82px' }} />
      </header>

      <Table borderless>
        <thead>
          <tr className="bg-secondary text-white">
            <th>Description</th>
            <th className="text-end">Price</th>
            <th className="fit" />
          </tr>
        </thead>
        <tr className="bg-white">
          <td>
            <div className="skeleton-item mx-1" style={{ height: '24px', width: '150px' }} />
          </td>
          <td className="text-end">
            <div className="skeleton-item" style={{ height: '24px', width: '48px' }} />
          </td>
          <td className="fit">
            <div className="skeleton-item" style={{ height: '24px', width: '24px' }} />
          </td>
        </tr>
        <tr className="bg-white">
          <td>
            <div className="skeleton-item mx-1" style={{ height: '24px', width: '100px' }} />
          </td>
          <td className="text-end">
            <div className="skeleton-item" style={{ height: '24px', width: '48px' }} />
          </td>
          <td className="fit">
            <div className="skeleton-item" style={{ height: '24px', width: '24px' }} />
          </td>
        </tr>
        <tr className="bg-white">
          <td>
            <div className="skeleton-item mx-1" style={{ height: '24px', width: '125px' }} />
          </td>
          <td className="text-end">
            <div className="skeleton-item" style={{ height: '24px', width: '48px' }} />
          </td>
          <td className="fit">
            <div className="skeleton-item" style={{ height: '24px', width: '24px' }} />
          </td>
        </tr>
      </Table>
    </div>
  );
};

const ListActions = ({ isOwner }) => {
  const [isDeleteModalShown, setIsDeleteModalShown] = useState(false);
  const [isEditModalShown, setIsEditModalShown] = useState(false);
  const [isAddItemModalShown, setIsAddItemModalShown] = useState(false);
  const [isShareModalShown, setIsShareModalShown] = useState(false);

  const context = useContext(ListContext);

  const list = context.list;

  const share = (
    <>
      <ShareModal show={isShareModalShown} close={() => setIsShareModalShown(false)} />
      <div className="cursor-pointer px-2 text-muted-hover" onClick={() => setIsShareModalShown(true)}>
        <FontAwesomeIcon icon={faShareAlt} />
      </div>
    </>
  );

  if (!isOwner) {
    return share;
  }

  return (
    <>
      {share}
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
      <AddItemModal isShown={isAddItemModalShown} close={() => setIsAddItemModalShown(false)} />
      <div className="cursor-pointer px-2 text-muted-hover" onClick={() => setIsAddItemModalShown(true)}>
        <FontAwesomeIcon icon={faPlus} />
      </div>
      <Dropdown>
        <Dropdown.Toggle as="div" bsPrefix="actions-dropdown" className="cursor-pointer text-muted-hover px-2">
          <FontAwesomeIcon icon={faEllipsisV} />
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight>
          <Dropdown.Item eventKey="2" onClick={() => setIsEditModalShown(true)}>
            Rename Wishlist
          </Dropdown.Item>
          <Dropdown.Item eventKey="3" className="text-danger" onClick={() => setIsDeleteModalShown(true)}>
            Delete Wishlist
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

const List = () => {
  const [isOwner, setIsOwner] = useState(false);

  const context = useContext(ListContext);
  const isLoading = context.loading;
  const isCurrentUserOwner = context.isCurrentUserOwner();

  useEffect(() => {
    if (!isLoading && isCurrentUserOwner) {
      setIsOwner(true);
    }
  }, [isLoading, isCurrentUserOwner]);

  if (!context.items.length) {
    return <EmptyList isOwner={isOwner} />;
  }

  const rows = context.items.map((item, idx) => {
    return <ItemRow key={idx} index={idx} item={item} isOwner={isOwner} />;
  });

  return (
    <div className="list-view">
      <header className="d-flex flex-row align-items-center">
        <h2 className="flex-grow-1">{context.list.name}</h2>
        <ListActions isOwner={isOwner} />
      </header>

      <Table borderless>
        <thead>
          <tr className="bg-secondary text-white">
            <th>Description</th>
            <th className="text-end">Price</th>
            <th className="fit" />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </div>
  );
};

const ListView = () => {
  return (
    <ListProvider wishlistId={useParams().id} loadingAs={<LoadingList />}>
      <List />
    </ListProvider>
  );
};

export default ListView;
