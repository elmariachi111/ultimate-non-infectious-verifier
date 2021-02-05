import React from 'react';
import { useIdentity } from '@immu/frontend';

const ReceiveCredential = () => {
  const { resolver } = useIdentity();

  return <div>Receive</div>;
};

export default ReceiveCredential;
