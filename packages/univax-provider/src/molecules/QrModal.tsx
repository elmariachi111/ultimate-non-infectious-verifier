import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useClipboard
} from '@chakra-ui/react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

const QrModal = ({ jwt, onClose }: { jwt: string; onClose: () => void }) => {
  const [qrCode, setQrCode] = useState<string>();

  const { onCopy, hasCopied } = useClipboard(jwt);

  useEffect(() => {
    (async () => {
      setQrCode(await QRCode.toDataURL(jwt));
    })();
  }, [jwt]);

  return (
    <Modal motionPreset="slideInBottom" onClose={onClose} isOpen={!!jwt}>
      <ModalOverlay />
      <ModalContent pb={5}>
        <ModalHeader>Credential Offer</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Heading size="sm">Scan this with an SSI wallet</Heading>
            <img src={qrCode} alt="qr code" onClick={onCopy} />
          </Box>
        </ModalBody>

        <ModalFooter justifyContent="center">
          {hasCopied && <Text color="green.400">copied to clipboard</Text>}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QrModal;
