import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import Layout from './components/layout';
import Loading from './components/loading';

import ListView from './views/lists/list-view';
import ListIndex from './views/lists/list-index';

import Home from './views/home';

import './scss/main.scss';

const Content = () => {
  const auth0Context = useAuth0();

  if (auth0Context.isLoading) {
    return <Loading />;
  } else if (!auth0Context.isAuthenticated) {
    return (
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/:id" element={<ListView />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  } else {
    return (
      <Routes>
        <Route exact path="/" element={<ListIndex />} />
        <Route exact path="/:id" element={<ListView />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }
};

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Content />
      </Layout>
    </BrowserRouter>
  );
};

export default App;
