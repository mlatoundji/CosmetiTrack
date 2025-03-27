import winston from 'winston'
import { format } from 'winston'

const logLevel = process.env.LOG_LEVEL || 'info'

const logger = winston.createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { service: 'cosmetitrack' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
  }))
}

export default logger 