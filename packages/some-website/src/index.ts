import dotenv from 'dotenv-flow';
dotenv.config();
import app from './server';

// Start the application by listening to specific port
const port = Number(process.env.PORT || 3141);
app.listen(port, () => {
  console.info('Express application started on port: ' + port);
});
