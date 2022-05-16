declare module '@/utils/Logger' {
  export class Logger {
    constructor()
    protected type: string[]
    protected typeColor(type: string): string
    isArray(obj: any): boolean
    getInstance(): Logger
    print(type: string, text: any, back?: boolean): void
    printBack(type: string, text: any): void
    pretty(type: any, title: string, ...text: any[]): void
    prettyPrimary(title: string, ...text: any[]): void
    prettySuccess(title: string, ...text: any[]): void
    prettyWarn(title: string, ...text: any[]): void
    prettyError(title: string, ...text: any[]): void
    prettyInfo(title: string, ...text: any[]): void
  }
  export default Logger
}
