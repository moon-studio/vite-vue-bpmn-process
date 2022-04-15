/* 空函数 */
export function noop() {}

/**
 * 校验非空
 * @param {*} val
 * @return boolean
 */
export function notEmpty(val) {
  if (!notNull(val)) {
    return false
  }
  if (getRawType(val) === 'array') {
    return val.length
  }
  if (getRawType(val) === 'object') {
    return Reflect.ownKeys(val).length
  }
  return true
}
export function notNull(val) {
  return val !== undefined && val !== null
}

/**
 * 返回数据原始类型
 * @param value
 * @return { 'string' | 'array' | 'boolean' | 'number' | 'object' | 'function' } type
 */
export function getRawType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
}
