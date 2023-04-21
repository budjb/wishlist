import React from 'react';

const reservedProps = ['children'];

const ExternalLink = props => {
  const passProps = Object.keys(props)
    .filter(key => !reservedProps.includes(key))
    .reduce((res, key) => {
      res[key] = props[key];
      return res;
    }, {});

  return (
    <a {...passProps} target="_blank" rel="noopener noreferrer">
      {props.children}
    </a>
  );
};

export default ExternalLink;
