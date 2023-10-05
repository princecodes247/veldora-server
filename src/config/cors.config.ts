import allowedOrigins from './origins.config';

const corsOptions = {
  origin: allowedOrigins,
  // methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  credentials: true,
};

export default corsOptions;
