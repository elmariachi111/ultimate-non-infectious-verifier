import { Router } from 'express';
import { COMM_ENDPOINT } from '../../constants/endpoint';

export const router: Router = Router();

const interactions: {
  [interactionToken: string]: any[];
} = {};

router.get(COMM_ENDPOINT + '/listen/:interactionToken', async (req, res) => {
  res.header('Cache-Control', 'no-cache');
  res.header('Content-Type', 'text/event-stream');

  interactions[req.params.interactionToken]
    ? interactions[req.params.interactionToken].push(res)
    : (interactions[req.params.interactionToken] = [res]);

  res.write(`event: connected \n`);
  res.write(`data: ${req.params.interactionToken} \n\n`);
  console.log(`stream ${req.params.interactionToken} open`);
});

router.delete(COMM_ENDPOINT + '/listen/:interactionToken', async (req, res) => {
  const streams = interactions[req.params.interactionToken];
  if (streams) {
    for (const stream of streams) {
      stream.write(`event: disconnected`);
      stream.write(`data: ${req.params.interactionToken} \n\n`);
      stream.end();
    }
  }
  res.status(200).send('closed');
});

router.post(COMM_ENDPOINT + '/:interactionToken', async (req, res) => {
  const streams = interactions[req.params.interactionToken];
  const flow = req.query.flow;

  const data = JSON.stringify(req.body);
  if (streams) {
    for (const stream of streams) {
      stream.write(`event: ${flow}\n`);
      stream.write(`data: ${data}\n\n`);
    }
    res.status(200).json({ msg: 'ok' });
  } else {
    res.status(500).json({ error: 'interaction token invalid' });
  }
});
