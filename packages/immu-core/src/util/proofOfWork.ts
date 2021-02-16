//just added for fun. Likely leeds nowhere ;)
import { keccak256 } from 'web3-utils';

function pfx(hash: string) {
  return hash.substr(2, 6);
}

function fmt(message: string, nonce: number) {
  return JSON.stringify({
    message,
    nonce
  });
}
function pow(message: string) {
  let nonce = 0;

  let hash = keccak256(fmt(message, nonce));

  while (pfx(hash) != '000000') {
    nonce++;
    hash = keccak256(fmt(message, nonce));
  }
  console.log(fmt(message, nonce), hash);
}

pow('hello');
export default pow;
