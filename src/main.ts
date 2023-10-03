import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import { record } from '@logdrop/node';
import MongoStore from 'connect-mongo';
import express from 'express';
const app = express();

import cors from 'cors';
// import { corsOptions } from './config';
import sgMail from '@sendgrid/mail';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectToDatabase from './config/database.config';
import routes from './routes';
// import { isWhitelisted } from "./modules/auth/auth.middleware";
import {
  COOKIE_SECRET,
  DATABASE_URL,
  LOGDROP_API_KEY,
  PORT,
  SENDGRID_API_KEY,
  env,
} from './config/env.config';

/* Sendgrid implementation */
sgMail.setApiKey(SENDGRID_API_KEY);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
// app.use(isWhitelisted);
app.use(
  record(LOGDROP_API_KEY, {
    exclude: ['/'],
  }),
);
// Cross Origin Resource Sharing
app.use(
  cors(),
  //   {
  //   origin: 'http://localhost:3000',
  //   methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
  //   credentials: true,
  // }
);
// app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies

const sess = {
  secret: COOKIE_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
  store: MongoStore.create({ mongoUrl: DATABASE_URL, dbName: 'appSession' }),
};

if (env.isProd) {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}

app.use(session(sess));

app.get('/', (req, res) => {
  res.send('Health Check');
});

const httpServer = createServer(app);

routes(app);

connectToDatabase(() => {
  console.log(`Running on ${process.env.NODE_ENV} mode`);

  httpServer.listen(PORT);

  console.log(`Server running on port ${PORT}`);
});
