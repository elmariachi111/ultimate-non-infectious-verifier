import { Router } from 'express';
import { SECRET_ENDPOINT, PUBLIC_ENDPOINT } from '../../constants/endpoint';
// Export module for registering router in express app
export const router: Router = Router();

const MAY_SEE_SECRETS = 'may_see_secrets';

//auth middleware, based on session values.
router.use(SECRET_ENDPOINT, async (req, res, next) => {
  if (!req.session.did) {
    await req.flash('info', `you're not authenticated`);
    return res.redirect(PUBLIC_ENDPOINT + '/');
  }

  if (!req.session.roles) {
    await req.flash('info', `you're not authorized`);
    return res.status(401).redirect(PUBLIC_ENDPOINT + '/');
  }

  if (!req.session.roles.includes(MAY_SEE_SECRETS)) {
    await req.flash('info', `you're not authorized to see secrets`);
    return res.status(401).redirect(PUBLIC_ENDPOINT + '/');
  }
  next();
});

// Define your routes here
router.get(SECRET_ENDPOINT + '/', (req, res) => {
  return res.render('secret/secret.twig', {
    secret: 'Costello'
  });
});
