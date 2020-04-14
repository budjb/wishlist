import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default ({ isShown, close, addList }) => {
  const [validated, setValidated] = useState(false);

  let nameRef;

  const handleSubmit = (event) => {
    const form = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === false) {
      setValidated(true);
    } else {      
      addList(nameRef.value);
      close();
    }
  };

  return (
    <Modal show={isShown} onHide={close}>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Create Wishlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control ref={ref => nameRef = ref} type="text" placeholder="List name" required/>
            <Form.Control.Feedback type="invalid">
              Wishlist name is required.
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
