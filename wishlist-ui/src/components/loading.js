import React from 'react';
import { Spinner } from 'react-bootstrap';

export default () => {
  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <Spinner animation="border" />
    </div>
  );
};
