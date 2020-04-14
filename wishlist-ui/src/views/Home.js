import React, { useContext } from 'react';
import { Auth0Context } from '../Auth0';
import { Button, Jumbotron } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

export default () => {
  const auth0Context = useContext(Auth0Context);

  return (
    <Jumbotron className="bg-white">
      <h1>Welcome to Wishlist</h1>
      <p>Wishlist gives you a tool to help track and share the things you want!</p>
      
      <blockquote class="blockquote">
        <p class="mb-0">
          This app was created because I'd get asked what I want for a birthday
          or holiday, and I usually never had a good answer. Using this, I can
          share some ideas with people. I hope you find this tool useful!
        </p>
        <footer class="blockquote-footer bg-transparent">Bud</footer>
      </blockquote>
      <p>
        <Button variant="primary" onClick={auth0Context.loginWithRedirect}>Sign In <FontAwesomeIcon icon={faSignInAlt}/></Button>
      </p>
    </Jumbotron>
  );
}