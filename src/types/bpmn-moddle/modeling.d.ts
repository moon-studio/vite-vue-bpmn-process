declare class Modeling {
    constructor();
    createShape(type: string, attrs: any, target: any, parent: any, sibling: any, refNode: any): any;
    createConnection(type: string, attrs: any, source: any, target: any, parent: any, sibling: any, refNode: any): any;
    createLabel(type: string, attrs: any, target: any, parent: any, sibling: any, refNode: any): any;
    createIndex(type: string, attrs: any, target: any, parent: any, sibling: any, refNode: any): any;
    createRoot(type: string, attrs: any, target: any, parent: any, sibling: any, refNode: any): any;
    getParent(element: any): any;
    getParentByType(element: any, type: string): any;
    getParentIndex(element: any): number;
    remove(element: any, parent: any): void;
    removeShape(element: any, parent: any): void;
    removeConnection(element: any, parent: any): void;
    removeLabel(element: any, parent: any): void;
    removeIndex(element: any, parent: any): void;
    removeRoot(element: any, parent: any): void;
    setParent(element: any, newParent: any, parent: any): void;
    setParentIndex(element: any, index: number, parent: any): void;
    update(element: any, newElement: any, parent: any): void;
    updateShape(element: any, newElement: any, parent: any): void;
    updateConnection(element: any, newElement: any, parent: any): void;
    updateLabel(element: any, newElement: any, parent: any): void;
    updateIndex(element: any, newElement: any, parent: any): void;
    updateRoot(element: any, newElement: any, parent: any): void;
}
