import express, { Express } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import { flash } from 'express-flash-message';

import { getFilesWithKeyword } from './utils/getFilesWithKeyword';

import twig from './utils/twig';

declare module 'express-session' {
  export interface SessionData {
    nonce: string;
    did?: string;
    roles?: string[];
  }
}

const app: Express = express();

/************************************************************************************
 *                              Basic Express Middlewares
 ***********************************************************************************/

app.engine('twig', twig);
app.set('view engine', 'twig');
app.set('views', __dirname + '/app/views');

app.set('json spaces', 4);
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1); // trust first proxy
app.use(
  session({
    secret: 's3Cur3',
    name: 'sessionId',
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: undefined }
  })
);

//flash messages
app.use(flash({ sessionKeyName: 'flashMessage' }));
app.use(async (req, res, next) => {
  const info = await req.consumeFlash('info');
  res.locals.messages = info;
  next();
});
app.use(async (req, res, next) => {
  res.locals.session = req.session;
  next();
});
// Handle logs in console during development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(cors());
}

// Handle security and origin in production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

/************************************************************************************
 *                               Register all routes
 ***********************************************************************************/

getFilesWithKeyword('router', 'src/app').forEach((file: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { router } = require(file.replace('src', '.'));
  app.use('/', router);
});

/************************************************************************************
 *                               Express Error Handling
 ***********************************************************************************/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  return res.status(500).json({
    errorName: err.name,
    message: err.message,
    stack: err.stack || 'no stack defined'
  });
});

export default app;
