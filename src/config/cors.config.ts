import allowedOrigins from './origins.config';

const corsOptions = {
  origin: (
    origin?: string,
    callback: (x: any, y?: boolean) => void = () => {},
  ) => {
    if (allowedOrigins.indexOf(origin ?? '') !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS.'));
    }
  },
  optionsSuccessStatus: 200,
};

export default corsOptions;
