import newrelic from 'newrelic'
import logger from './logger'

export function trackError(error: Error, context?: Record<string, any>) {
  logger.error('Application error:', { error, context })
  newrelic.noticeError(error, context)
}

export function trackMetric(name: string, value: number) {
  newrelic.recordMetric(name, value)
}

export function trackCustomEvent(name: string, attributes: Record<string, any>) {
  newrelic.recordCustomEvent(name, attributes)
}

export function startSegment(name: string, callback: () => Promise<any>) {
  return newrelic.startSegment(name, true, callback)
}

export function addCustomAttribute(key: string, value: any) {
  newrelic.addCustomAttribute(key, value)
} 