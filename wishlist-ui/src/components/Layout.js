import React from 'react';
import Toolbar from './Toolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import ExternalLink from './ExternalLink';

import './Layout.css';
import { faBlog } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="d-flex flex-row align-items-center position-relative">
      <div className="flex-grow-1 p-2 text-muted">
        <p className="p-0 m-0 pl-1">Copyright &copy; 2020 Bud Byrd</p>
        <ExternalLink href="https://budjb.com" className="p-1 text-muted-hover">
          <FontAwesomeIcon icon={faBlog}/>
        </ExternalLink>
        <ExternalLink href="https://twitter.com/BudByrd" className="p-1 text-muted-hover">
          <FontAwesomeIcon icon={faTwitter}/>
        </ExternalLink>
        <ExternalLink href="https://www.linkedin.com/in/bud-byrd-b662555b" className="p-1 text-muted-hover">
          <FontAwesomeIcon icon={faLinkedin}/>
        </ExternalLink>
        <ExternalLink href="https://github.com/budjb" className="p-1 text-muted-hover">
          <FontAwesomeIcon icon={faGithub}/>
        </ExternalLink>
      </div>
      <ExternalLink href="https://github.com/budjb/wishlist" title="Fork me on GitHub" className="fork-me d-flex flex-column align-self-end justify-content-end align-items-end">
        <div className="p-1">
          <FontAwesomeIcon icon={faGithub}/>
        </div>
      </ExternalLink>
    </footer>
  );
};

export default ({ children }) => {
  return (
    <div className="main-container d-flex flex-column">
      <header className="p-2">
        <Toolbar/>
      </header>
      <main className="px-2 py-5 flex-grow-1">
        {children}
      </main>
      <Footer/>
    </div>
  );
}