import winston from 'winston';
import { config } from 'tightship-config';

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const logger = winston.createLogger({
  levels: logLevels,
  transports: [new winston.transports.Console()],
});

if (config.get('logger.levelOverride')) {
  logger.level = config.get('logger.levelOverride')
} else {
  logger.level = (config.get('env') == 'development') ? 'debug' : 'error';
}


export { logger };
