// src/components/PrivateRoute.js

import React, { useEffect, useContext } from "react";
import { Route } from "react-router-dom";
import { Auth0Context } from "../Auth0";

export default ({ component: Component, path, ...rest }) => {
  const { loading, isAuthenticated, loginWithRedirect } = useContext(Auth0Context);

  useEffect(() => {
    if (loading || isAuthenticated) {
      return;
    }
    const fn = async () => {
      await loginWithRedirect({
        appState: {targetUrl: window.location.pathname}
      });
    };
    fn();
  }, [loading, isAuthenticated, loginWithRedirect, path]);

  const render = props =>
    isAuthenticated === true ? <Component {...props} /> : null;

  return <Route path={path} render={render} {...rest} />;
};

export default PrivateRoute;
