declare class EventEmitter {
    private _events;
    private static _instance;
    static instance(): EventEmitter;
    constructor();
    private _addListener;
    addListener(type: string, fn: any, context?: any): this;
    on(type: string, fn: any, context?: any): this;
    once(type: string, fn: any, context?: any): this;
    emit(type: any, ...rest: any[]): boolean;
    removeListener(type: any, fn: any): this;
    removeAllListeners(type: any): this;
    listeners(type: any): Function[];
    listenerCount(type: any): number;
    eventNames(): string[];
}
declare const _default: {
    EventEmitter: typeof EventEmitter;
    instance: EventEmitter;
};
export default _default;
