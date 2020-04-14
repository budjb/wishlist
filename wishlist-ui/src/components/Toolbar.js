import React, { useContext } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faSignInAlt, faListAlt } from '@fortawesome/free-solid-svg-icons';
import { Auth0Context } from '../Auth0';
import { Link } from 'react-router-dom';

import './Toolbar.css';

const Login = ({ handler }) => {
  return (
    <span style={{cursor: "pointer"}} className="d-inline-block" onClick={handler}>
      Sign In <FontAwesomeIcon icon={faSignInAlt}/>
    </span>
  );
};

const UserOptions = ({ handler, user }) => {
  return (
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
        <Dropdown.Item eventKey="1" onClick={handler}>
          Sign Out <FontAwesomeIcon icon={faSignOutAlt}/>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const Auth = ({ context }) => {
  if (context.loading) {
    return '';
  } else if (!context.isAuthenticated) {
    return <Login handler={context.loginWithRedirect}/>;
  } else {
    return <UserOptions user={context.user} handler={context.logout}/>
  }
}

export default () => {
  const auth0Context = useContext(Auth0Context);

  return (
    <div className="d-flex flex-row align-items-center">
      <Link to="/" className="toolbar-home-link flex-grow-1 cursor-pointer" style={{fontSize: "1.5rem"}}><FontAwesomeIcon icon={faListAlt}/> Wishlist</Link>
      <Auth context={auth0Context}/>
    </div>
  );
};
