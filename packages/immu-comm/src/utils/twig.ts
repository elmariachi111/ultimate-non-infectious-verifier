import { TwingEnvironment, TwingLoaderFilesystem, TwingLoaderRelativeFilesystem, TwingLoaderChain } from 'twing';

const loader = new TwingLoaderFilesystem(__dirname + '/../app/views');
const twingEnvironment = new TwingEnvironment(new TwingLoaderChain([loader, new TwingLoaderRelativeFilesystem()]));

// eslint-disable-next-line @typescript-eslint/ban-types
const twig = (path: string, options: object, callback: Function) => {
  twingEnvironment
    .render(path, options)

    .then((output) => {
      callback(null, output);
    })
    .catch((e) => {
      console.error(e);
      callback(e);
    });
};

export default twig;
