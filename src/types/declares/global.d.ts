declare global {
  interface Window {
    bpmnInstances: {
      [key: string]: any
    }
  }
}

// interface MyWindow extends Window {
//   bpmnInstances: any;
// }
//
// declare const window: MyWindow;
