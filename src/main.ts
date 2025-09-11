import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config(); // load env variables FIRST

import './core/dataBase/db'; // then connect to DB

import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 5001;
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.listen(PORT, () => console.log(`server upon port ${PORT}`));
