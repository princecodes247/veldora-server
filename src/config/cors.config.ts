import allowedOrigins from './origins.config';

const corsOptions = {
  origin: function (origin, callback) {
    console.log({ origin });
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  credentials: true,
};

export default corsOptions;
