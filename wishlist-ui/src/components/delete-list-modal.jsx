import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

const DeleteListModal = ({ list, isShown, close, deleteList }) => {
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const handleDeleteList = () => {
    setBusy(true);
    deleteList(list.id)
      .then(() => {
        setBusy(false);
        setErrorMessage(undefined);
        close();
      })
      .catch(() => {
        setBusy(false);
        setErrorMessage('An unexpected error prevented the list from being deleted.');
      });
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <p>Are you sure you want to delete the {list.name} wishlist?</p>
        <Alert variant="danger">This action can not be undone!</Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleDeleteList} disabled={busy}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteListModal;
