import PeerId from 'peer-id';
import WebRTCStar from 'libp2p-webrtc-star'
import { NOISE } from 'libp2p-noise'
import Mplex from 'libp2p-mplex'
import Bootstrap from 'libp2p-bootstrap'
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import Libp2p from 'libp2p';
import bs58 from 'bs58';
import pipe from 'it-pipe';
import { EventEmitter } from 'eventemitter3';

export type P2PMessage = {
  type: string;
  signature: string;
  publicKey: string;
  content: string;
  peer?: string;
}

interface ILibP2PContext {
  p2p: Libp2p | null;
  peerId: PeerId | null;
  rendezvousServer: string;
  messageEmitter: typeof EventEmitter;
}

const LibP2PContext = React.createContext<ILibP2PContext>({
  p2p: null,
  peerId: null,
  rendezvousServer: "",
  //@ts-ignore
  messageEmitter: new EventEmitter<Events>()
});

const useLibP2P = () => useContext(LibP2PContext); 

const recoverOrCreatePeerId = async (): Promise<PeerId> => {
  const _peerId = localStorage.getItem("peerId");
  let peerId: PeerId; 
  if (_peerId) {
    peerId = await PeerId.createFromJSON(JSON.parse(_peerId));
  } else {
    peerId = await PeerId.create();
    localStorage.setItem("peerId", JSON.stringify(peerId.toJSON()));
  }
  return peerId;
}

const LibP2PProvider = ({ rendezvousServer,  children }: {rendezvousServer: string, children: ReactNode}) => {
  
  const [p2p, setP2P] = useState<Libp2p | null>(null);
  const [peerId, setPeerId] = useState<PeerId | null>(null);

  const messageEmitter = new EventEmitter();
  
  useEffect(() => {
    console.debug("starting libp2p");
    
    (async () => {
      const _peerId = await recoverOrCreatePeerId();
      setPeerId(_peerId);
      const _libp2p = await Libp2p.create({
        peerId: _peerId,
        addresses: {
          listen: [
            rendezvousServer
          ]
        },
        modules: {
          transport: [WebRTCStar],
          connEncryption: [NOISE],
          streamMuxer: [Mplex]
        },
        config: {
          
          peerDiscovery: {
            autoDial: false,
            [Bootstrap.tag]: {
              enabled: false
            }
          }
        }
      })
      await _libp2p.start()
      console.debug("libp2p started");
      setP2P(_libp2p);
    })();

    return () => {
      console.log("stopping");
     p2p?.stop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!p2p) return;
    console.log('new listeners');
    p2p.connectionManager.on('peer:connect', (connection: any) => {
      console.log(`Connected to ${connection.remotePeer.toB58String()}`);
    });
    p2p.handle('/comm', async ({ stream }: { stream: any }) => {
      await pipe(stream.source, receive);
    });
    return () => {
      console.log('off listeners');
      p2p.removeAllListeners();
      p2p.connectionManager.removeAllListeners();
    };
  }, [p2p]);

  const receive = async function (source: AsyncGenerator<any>): Promise<P2PMessage[]> {
    const textEncoder = new TextEncoder();
    const msgs: P2PMessage[] = [];
    for await (const msg of source) {
      const p2pMessage: P2PMessage = JSON.parse(msg.toString());

      const remotePeer = await PeerId.createFromPubKey(p2pMessage.publicKey);
      const verified = await remotePeer.pubKey.verify(
        textEncoder.encode(p2pMessage.content),
        bs58.decode(p2pMessage.signature)
      );
      console.log('message verified: ', verified);
      p2pMessage.peer = remotePeer.toB58String();
      messageEmitter.emit(p2pMessage.type, p2pMessage.content);
    }
    return msgs;
  };

  //@ts-ignore
  return <LibP2PContext.Provider value={{ p2p, peerId, rendezvousServer, messageEmitter }}>
    {children}
  </LibP2PContext.Provider>
}

export {LibP2PProvider, useLibP2P};