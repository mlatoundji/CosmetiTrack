import newrelic from 'newrelic'
import logger from './logger'

// Check if New Relic is available
const isNewRelicAvailable = typeof newrelic !== 'undefined'

export function trackError(error: Error, context?: Record<string, any>) {
  try {
    logger.error('Application error:', { error, context })
    if (isNewRelicAvailable) {
      newrelic.noticeError(error, context)
    }
  } catch (err) {
    logger.error('Failed to track error:', { error: err })
  }
}

export function trackMetric(name: string, value: number) {
  try {
    if (isNewRelicAvailable) {
      newrelic.recordMetric(name, value)
    }
  } catch (err) {
    logger.error('Failed to track metric:', { name, value, error: err })
  }
}

export function trackCustomEvent(name: string, attributes: Record<string, any>) {
  try {
    if (isNewRelicAvailable) {
      newrelic.recordCustomEvent(name, attributes)
    }
  } catch (err) {
    logger.error('Failed to track custom event:', { name, attributes, error: err })
  }
}

export function startSegment(name: string, callback: () => Promise<any>) {
  try {
    if (isNewRelicAvailable) {
      return newrelic.startSegment(name, true, callback, () => {})
    }
    return callback()
  } catch (err) {
    logger.error('Failed to start segment:', { name, error: err })
    return callback()
  }
}

export function addCustomAttribute(key: string, value: any) {
  try {
    if (isNewRelicAvailable) {
      newrelic.addCustomAttribute(key, value)
    }
  } catch (err) {
    logger.error('Failed to add custom attribute:', { key, value, error: err })
  }
} 