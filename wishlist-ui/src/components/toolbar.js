import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faSignInAlt, faListAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

const Login = ({ handler }) => {
  return (
    <span style={{ cursor: 'pointer' }} className="d-inline-block" onClick={handler}>
      Sign In <FontAwesomeIcon icon={faSignInAlt} />
    </span>
  );
};

const UserOptions = ({ handler, user }) => {
  return (
    <Dropdown>
      <Dropdown.Toggle as="div" className="profile-button">
        <img alt="" src={user.picture} />
      </Dropdown.Toggle>
      <Dropdown.Menu alignRight>
        <Dropdown.Header>
          <div className="text-body">{user.name}</div>
          <div className="text-muted">{user.email}</div>
        </Dropdown.Header>
        <Dropdown.Divider />
        <Dropdown.Item eventKey="1" onClick={handler}>
          Sign Out <FontAwesomeIcon icon={faSignOutAlt} />
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const Auth = ({ context }) => {
  if (context.isLoading) {
    return '';
  } else if (!context.isAuthenticated) {
    return <Login handler={context.loginWithRedirect} />;
  } else {
    return <UserOptions user={context.user} handler={context.logout} />;
  }
};

const Toolbar = () => {
  const auth0Context = useAuth0();

  return (
    <div className="d-flex flex-row align-items-center">
      <div className="flex-grow-1">
        <Link to="/" className="toolbar-home-link flex-grow-1 cursor-pointer">
          <FontAwesomeIcon icon={faListAlt} className="site-logo" /> Wishlist
        </Link>
      </div>
      <Auth context={auth0Context} />
    </div>
  );
};

export default Toolbar;
