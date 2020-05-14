import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';

export default ({ list, isShown, close, updateList }) => {
  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  let nameRef;

  const handleSubmit = event => {
    const form = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
      setValidated(true);
    } else if (list.name === nameRef.value) {
      close();
    } else {
      setBusy(true);
      updateList(list.id, { name: nameRef.value })
        .then(() => {
          setBusy(false);
          setErrorMessage(undefined);
          close();
        })
        .catch(() => {
          setBusy(false);
          setErrorMessage('An unexpected error prevented the list from being saved.');
        });
    }
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              ref={ref => (nameRef = ref)}
              type="text"
              placeholder="List name"
              defaultValue={list.name}
              required
            />
            <Form.Control.Feedback type="invalid">List name is required.</Form.Control.Feedback>
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
