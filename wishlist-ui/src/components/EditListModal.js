import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default ({ list, isShown, close, saveList }) => {
  const [validated, setValidated] = useState(false);

  let nameRef;

  const handleSubmit = event => {
    const form = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
      setValidated(true);
    } else {
      if (list.name !== nameRef.value) {
        saveList(list.id, nameRef.value);
        // context.renameList(context.list.id, nameRef.value);
      }
      close();
    }
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control ref={ref => nameRef = ref} type="text" placeholder="List name"
              defaultValue={list.name} required/>
            <Form.Control.Feedback type="invalid">
              List name is required.
            </Form.Control.Feedback>
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
