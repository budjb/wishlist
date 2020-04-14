import React, { useContext } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Auth0Context } from './Auth0';

import { WishlistApiProvider } from './data/WishlistApi';

import Layout from './components/Layout';
import Loading from './components/Loading';

import ListView from './views/lists/View';
import ListIndex from './views/lists/Index';

import Home from './views/Home';

import './App.css';

const Content = () => {
  const auth0Context = useContext(Auth0Context);

  if (auth0Context.loading) {
    return <Loading/>;
  } else if (!auth0Context.isAuthenticated) {
    return (
      <WishlistApiProvider>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route path="/:id" component={ListView}/>
        </Switch>
      </WishlistApiProvider>
    );
  } else {
    return (
      <WishlistApiProvider>
        <Switch>
          <Route exact path="/" component={ListIndex}/>
          <Route exact path="/:id" component={ListView}/>
        </Switch>
      </WishlistApiProvider>
    );
  }
};

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Layout>
          <Content/>
        </Layout>
        <Redirect to="/"/>
      </Switch>
    </BrowserRouter>
  );
};
