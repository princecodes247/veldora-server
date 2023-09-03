import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
const app = express();

import cors from 'cors';
import { corsOptions } from './config';
import sgMail from '@sendgrid/mail';
import cookieParser from 'cookie-parser';
import connectToDatabase from './config/database.config';
import routes from './routes';
// import { isWhitelisted } from "./modules/auth/auth.middleware";
import { PORT, SENDGRID_API_KEY } from './config/env.config';

/* Sendgrid implementation */
sgMail.setApiKey(SENDGRID_API_KEY);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
// app.use(isWhitelisted);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

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
