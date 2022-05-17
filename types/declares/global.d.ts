// @ts-ignore

declare global {
  interface Window {
    bpmnInstances: any
  }
  interface Object {
    [key: string | number]: string | number | boolean | undefined | null | Object | Function
  }
}

declare interface Window {
  bpmnInstances: any
}

// interface MyWindow extends Window {
//   bpmnInstances: any;
// }
//
// declare const window: MyWindow;
