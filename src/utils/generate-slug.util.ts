import { nanoid } from 'nanoid';

const generateSlug = () => {
  const alphabet =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-';
  // const nanoid = customAlphabet(alphabet, 9);
  return nanoid(5);
};

export default generateSlug;
