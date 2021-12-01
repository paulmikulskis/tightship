import createError from 'http-errors';
import express, { json, urlencoded } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import { router as indexRouter } from './routes/index.js';
import { config } from 'tightship-config';
import Arena from 'bull-arena';
import Bull from 'bull';
import monitoro from 'monitoro';

var app = express();

// view engine setup
app.set('views', join(process.cwd(), 'views'));
app.set('view engine', 'jade');

if (config.get('env') != 'test') {
  app.use(logger('dev'));
};
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(join(process.cwd(), 'public')));

app.use('/', indexRouter);

// setting up the nice looking stats dashboard
const queueConfigArray = [
  { 
    'name': config.get('bull.queues.daily'), 
    'url': config.get('redis.host') 
  }
]

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const module = {
  app,
};

export { app };

