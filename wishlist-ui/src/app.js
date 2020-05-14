import React, { useContext } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Auth0Context } from './auth0';

import Layout from './components/layout';
import Loading from './components/loading';

import ListView from './views/lists/list-view';
import ListIndex from './views/lists/list-index';

import Home from './views/home';

import './scss/main.scss';

const Content = () => {
  const auth0Context = useContext(Auth0Context);

  if (auth0Context.loading) {
    return <Loading />;
  } else if (!auth0Context.isAuthenticated) {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/:id" component={ListView} />
      </Switch>
    );
  } else {
    return (
      <Switch>
        <Route exact path="/" component={ListIndex} />
        <Route exact path="/:id" component={ListView} />
      </Switch>
    );
  }
};

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Layout>
          <Content />
        </Layout>
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
};
