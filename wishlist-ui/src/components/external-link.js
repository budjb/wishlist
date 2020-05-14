import React from 'react';

const reservedProps = ['children'];

export default props => {
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
