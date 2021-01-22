import { Router } from 'express';
import { SECRET_ENDPOINT } from '../../constants/endpoint';

// Export module for registering router in express app
export const router: Router = Router();

router.use(SECRET_ENDPOINT, (req, res, next) => {
  
  console.log('hit a secret route.');
  next();
});

// Define your routes here
router.get(SECRET_ENDPOINT + '/', (req, res) => {
  res.status(200).send({
    message: 'The secret of the day is "Costello"'
  });
});

