import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

export default ({ list, isShown, close, deleteList }) => {
  const handleDeleteList = () => {
    deleteList(list.id);
    close();
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the {list.name} wishlist?</p>
        <Alert variant="danger">This action can not be undone!</Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleDeleteList}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
