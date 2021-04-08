import { Jolocom } from "@univax/core";

const jolocom: Promise<Jolocom.JolocomSDK> =  (async() => {
  return Jolocom.initSdk();
})();

export default jolocom;
