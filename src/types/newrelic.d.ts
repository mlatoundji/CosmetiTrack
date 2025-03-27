declare module 'newrelic' {
  interface NewRelic {
    addCustomAttribute(key: string, value: any): void;
    addCustomAttributes(attributes: Record<string, any>): void;
    recordCustomEvent(eventType: string, attributes: Record<string, any>): void;
    setTransactionName(name: string): void;
    startSegment(name: string, record: boolean, handler: () => any, callback: () => any): any;
    startWebTransaction(url: string, handler: () => any): any;
    endTransaction(): void;
    noticeError(error: Error, customAttributes?: Record<string, any>): void;
    recordMetric(name: string, value: number): void;
  }

  const newrelic: NewRelic;
  export default newrelic;
} 