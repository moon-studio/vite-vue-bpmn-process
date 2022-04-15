declare global {
  interface Window {
    bpmnInstances: {
      [key: any]: any
    }
  }
}

// interface MyWindow extends Window {
//   bpmnInstances: any;
// }
//
// declare const window: MyWindow;
