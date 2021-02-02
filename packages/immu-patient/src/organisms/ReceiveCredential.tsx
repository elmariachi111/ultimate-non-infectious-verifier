import React from 'react';
import { useIdentity } from 'context/IdentityContext';

const ReceiveCredential = () => {
  const { resolver } = useIdentity();

  return <div>Receive</div>;
};

export default ReceiveCredential;
