import { getRawType, notNull } from './tools'

const isArray = (obj) => getRawType(obj) === 'array'
const isNullOrUndefined = (obj) => !notNull(obj)

class EventEmitter {
  private _events: { [key: string]: Function[] } = {}
  private static _instance: null | EventEmitter = null

  static instance(): EventEmitter {
    // 单例模式
    if (!this._instance) {
      this._instance = new EventEmitter()
    }
    return this._instance
  }

  constructor() {
    if (this._events === undefined) {
      this._events = Object.create(null)
    }
  }

  private _addListener(type: string, fn: any, context?: any, once?) {
    if (typeof fn !== 'function') {
      throw new TypeError('fn must be a function')
    }

    fn.context = context
    fn.once = !!once

    const event = this._events[type]
    // only one, let `this._events[type]` to be a function
    if (isNullOrUndefined(event)) {
      this._events[type] = fn
    } else if (typeof event === 'function') {
      // already has one function, `this._events[type]` must be a function before
      this._events[type] = [event, fn]
    } else if (isArray(event)) {
      // already has more than one function, just push
      this._events[type].push(fn)
    }

    return this
  }

  addListener(type: string, fn: any, context?: any) {
    return this._addListener(type, fn, context)
  }

  on(type: string, fn: any, context?: any) {
    return this.addListener(type, fn, context)
  }

  once(type: string, fn: any, context?: any) {
    return this._addListener(type, fn, context, true)
  }

  emit(type, ...rest) {
    if (isNullOrUndefined(type)) {
      throw new Error('emit must receive at lease one argument')
    }

    const event: any = this._events[type]

    if (isNullOrUndefined(event)) return false

    if (typeof event === 'function') {
      event.call(event.context || null, ...rest)
      if (event.once) {
        this.removeListener(type, event)
      }
    } else if (isArray(event)) {
      event.map((e) => {
        e.call(e.context || null, ...rest)
        if (e.once) {
          this.removeListener(type, e)
        }
      })
    }

    return true
  }

  removeListener(type, fn) {
    if (isNullOrUndefined(this._events)) return this

    // if type is undefined or null, nothing to do, just return this
    if (isNullOrUndefined(type)) return this

    if (typeof fn !== 'function') {
      throw new Error('fn must be a function')
    }

    const events = this._events[type]

    if (typeof events === 'function') {
      events === fn && delete this._events[type]
    } else {
      const findIndex = events.findIndex((e) => e === fn)

      if (findIndex === -1) return this

      // match the first one, shift faster than splice
      if (findIndex === 0) {
        events.shift()
      } else {
        events.splice(findIndex, 1)
      }

      // just left one listener, change Array to Function
      if (events.length === 1) {
        // @ts-ignore
        this._events[type] = events[0]
      }
    }

    return this
  }

  removeAllListeners(type) {
    if (isNullOrUndefined(this._events)) return this

    // if not provide type, remove all
    if (isNullOrUndefined(type)) this._events = Object.create(null)

    const events = this._events[type]
    if (!isNullOrUndefined(events)) {
      // check if `type` is the last one
      if (Object.keys(this._events).length === 1) {
        this._events = Object.create(null)
      } else {
        delete this._events[type]
      }
    }

    return this
  }

  listeners(type) {
    if (isNullOrUndefined(this._events)) return []

    const events = this._events[type]
    // use `map` because we need to return a new array
    return isNullOrUndefined(events)
      ? []
      : typeof events === 'function'
      ? [events]
      : events.map((o) => o)
  }

  listenerCount(type) {
    if (isNullOrUndefined(this._events)) return 0

    const events = this._events[type]

    return isNullOrUndefined(events) ? 0 : typeof events === 'function' ? 1 : events.length
  }

  eventNames() {
    if (isNullOrUndefined(this._events)) return []

    return Object.keys(this._events)
  }
}

export default { EventEmitter, instance: EventEmitter.instance() }
