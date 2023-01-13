import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  const auth0Context = useAuth0();

  return (
    <div className="jumbotron bg-white">
      <h1>Welcome to Wishlist</h1>
      <p>Wishlist gives you a tool to help track and share the things you want!</p>

      <blockquote className="blockquote">
        <p className="mb-0">
          This app was created because I'd get asked what I want for a birthday or holiday, and I usually never had a
          good answer. Using this, I can share some ideas with people. I hope you find this tool useful!
        </p>
        <footer className="blockquote-footer bg-transparent">Bud</footer>
      </blockquote>
      <p>
        <Button variant="primary" onClick={auth0Context.loginWithRedirect}>
          Sign In <FontAwesomeIcon icon={faSignInAlt} />
        </Button>
      </p>
    </div>
  );
};

export default Home;
