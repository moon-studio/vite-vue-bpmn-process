export declare function noop(): void;
/**
 * 校验非空
 * @param {*} val
 * @return boolean
 */
export declare function notEmpty(val: any): any;
export declare function notNull(val: any): boolean;
/**
 * 返回数据原始类型
 * @param value
 * @return { 'string' | 'array' | 'boolean' | 'number' | 'object' | 'function' } type
 */
export declare function getRawType(value: any): string;
