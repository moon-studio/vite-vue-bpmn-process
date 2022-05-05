# Bpmn.js 中文文档

## 一. 引入Bpmn.js并初始化建模器

```javascript
/* 基于vue2.x， 省略了template模板与部分data */

import BpmnModeler from "bpmn-js/lib/Modeler"

export default {
    methods: {
        initModeler() {
            this.bpmnModeler = new BpmnModeler({
                container: document.getElementById("bpmn-container")
            })
        }
    },
    mounted() {
        this.initModeler();
    }
}
```

进入到源文件Modeler.js，可以找到创建Modeler建模器的时候需的参数。

```typescript
this.bpmnModeler = new BpmnModeler(options: Options）;

interface Options {
	container: DomElement; // 渲染容器
	width：string | number；// 查看器宽度
	height: string | number； // 查看器高度
	moddleExtensions： object；// 需要用的扩展包
	modules：<didi.Module>[]; // 自定义且需要覆盖默认扩展包的模块列表
	additionalModules: <didi.Module>[]; // 自定义且与默认扩展包一起使用的模块列表
}
```

初始化完成之后，在控制台打印<code>this.bpmnModeler</code>，可以发现<code>BpmnModeler</code>类继承了多个基础类。

```
Modeler
	-> BaseModeler
		-> BaseViewer
			-> Diagram
				-> Object
```

Bpmn.js提供的默认扩展包名称，可以在<code>this.bpmnModeler.__proto__._modules</code>内找到，一共开放了32个扩展包。扩展包名称可以在<code>this.bpmnModeler.injector._providers</code>内，包名即键名。

需要调用这些扩展包时，可以使用如下方式：

```JavaScript
const xxxModule = this.bpmnModeler.get("xxx"); // xxx代表扩展包名称
```

Modeler实例化之后可直接调用的方法：

```javascript
/**
 * 返回name对应的模块实例
 * @param { string } name 模块名
 * @param { boolean } strict 启用严格模式。false：缺少的模块解析为null返回；true：抛出异常
 */
this.bpmnModeler.get(name, strict);

// 创建空白流程图
// 内部调用了importXML方法，读取内部的默认xml字符串
this.bpmnModeler.createDiagram();

// 将图形dom挂载到目标节点
this.bpmnModeler.attachTo(parentNode);

// 清空
this.bpmnModeler.clear()

// 销毁
this.bpmnModeler.destroy()

// 脱离dom
this.bpmnModeler.detach()

// 获取流程定义
this.bpmnModeler.getDefinitions()

// 获取扩展功能模块列表
this.bpmnModeler.getModules()

/**
 * 导入解析的定义并呈现BPMN 2.0图。完成后，查看器将结果报告回给提供的回调函数（错误，警告）
 * @param { ModdleElement<Definitions> } definitions 模块名
 * @param { ModdleElement<BPMNDiagram>|string } [bpmnDiagram] 要呈现的BPMN图或图的ID（如果未提供，将呈现第一个）
 */
this.bpmnModeler.importDefinitions(definitions, bpmnDiagram)

/**
 * 导入xml（字符串形式），返回导入结果
 * 后续会取消传入回调函数的方式
 * 推荐使用async/await或者链式调用
 * @param { string } xml 流程图xml字符串
 * @param { Promise } callback 回调函数，出错时返回{ warnings，err }
 */
this.bpmnModeler.importXML(xml, callback)

// 注销事件监听器
this.bpmnModeler.off(eventName, callback)

// 注册事件监听，同名将删除以前的监听器，privorty可不传，程序会自动替换回调函数
this.bpmnModeler.on(eventName, priority, callback, target)

// em。。。不了解
this.bpmnModeler.open()

// 保存为svg文件，与importXML方法一样，后续会取消传入callback的方式
this.bpmnModeler.saveSVG(callback)

// 保存为xml文件，与importXML方法一样，后续会取消传入callback的方式
this.bpmnModeler.saveXML(callback)
	
```

## 二. 基础功能

使用过程中，常用的组件主要包含：<code>palette 左侧元素栏、 contentPad 元素操作块、 propertiesPanel右侧元素属性编辑栏</code>。

### 1. palette 与 contentPad

这两个组件在实例化建模器的时候已经渲染到了页面上，只需要引入对应的样式文件即可。

```javascript
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
```

### 2. propertiesPanel

使用这个组件需要在实例化建模器时修改配置项，并引入对应样式文件

```javascript
import "bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css"; // 右边工具栏样式

import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";

export default {
    methods: {
        initModeler() {
            this.bpmnModeler = new BpmnModeler({
                container: document.getElementById("bpmn-container"),
                propertiesPanel: {
                  parent: "#attrs-panel"
                },
                additionalModules: [ propertiesPanelModule, propertiesProviderModule ]
            })
        }
    },
    mounted() {
        this.initModeler();
    }
}
```

### 3. 汉化

在汉化之前，可以在github或者码云上找到很多大佬的翻译文件，将翻译文件下载下载保存到本地。

```typescript
// 1. 创建翻译文件 zh.js（命名随意），导出英文关键字对应的中文翻译
export default {
    "Append EndEvent": "追加结束事件",
    "Append Gateway": "追加网关",
    "Append Task": "追加任务",
    "Append Intermediate/Boundary Event": "追加中间抛出事件/边界事件",
    ...
}
    
// 2. 建立翻译模块方法customTranslate.js
import translations from "./zh";

export default function customTranslate(template, replacements) {
  replacements = replacements || {};

  // Translate
  template = translations[template] || template;

  // Replace
  return template.replace(/{([^}]+)}/g, function(_, key) {
    let str = replacements[key];
    if (
      translations[replacements[key]] !== null &&
      translations[replacements[key]] !== undefined
    ) {
      str = translations[replacements[key]];
    }
    return str || "{" + key + "}";
  });
}

// 3. 在实例化建模器时以自定义模块的方式传入参数
import customTranslate from "./pugins/customTranslate";

export default {
  methods: {
    initModeler() {
        this.bpmnModeler = new BpmnModeler({
            container: document.getElementById("bpmn-container"),
            additionalModules: [
            	{ translate: ["value", customTranslate] }
            ]
        })
    }
  }
}
```

> **翻译文件来自码云，但是忘记了作者的信息了，如果作者发现请您联系我更改或者删除**

### 4. 其他功能（非自定义的功能模块配置项）

添加键盘快捷键：

```javascript
this.bpmnModeler = new BpmnModeler({
    container: document.getElementById("bpmn-container"),
    keyboard: {
    	bindTo: document // 或者window，注意与外部表单的键盘监听事件是否冲突
    }
});
```

## 三. 事件

Bpmn.js 提供了EventBus事件总线模块来管理监听事件，并预设了244个事件（引入其他插件时，也会抛出其他事件）。

> 下面的元素对象指包含element元素的对象，其他属性不定（部分事件返回的对象也不包含element）。
>
> “ - ” 短横线表示暂时没有找到何时触发该事件
>
> 以下事件均可使用<code>this.bpmnModeler.on(eventName, callback)</code>或者<code>eventBus.on(eventName, callback)</code>的形式注册。

```typescript
// 通过事件总线发出的事件
interface InternalEvent {
    type: string; // 发生的事件名称，但是很快会被置为undefined
    element: Shape | Connection;
    elements: Element[];
    shape: Shape;
    context: object; // 有点复杂，有兴趣的朋友可以研究
    gfx?: SVGElement;
    svg?: SVGElement;
    viewport?: SVGElement;
    viewbox?: Viewbox;
    pad?: object; // 见 Element.pad
}

interface Element {
    element: Shape | Connection;
    gfx?: SVGElement;
    pad?: {
        id: string;
        html: DOMElement;
        position: { right: number; top: number };
    	scale: { max: number; min: number };
    	show: object | null;
    	type: string; // 一般是"context-pad"
    }
}

interface Elements {
    elements: Array<Shape | Connection>
}

interface Canvas {
    svg?: SVGElement;
    viewport?: SVGElement;
}

interface Viewbox {
	viewbox: {
        height: number;
        width: number;
        x: number;
        y: number;
        inter: object; // 包含x,y,width,height的一个对象
        outer: object; // 包含x,y,width,height的一个对象
        scale: number; // 当前缩放比例（小数）
	}
}
```



| 序号 | 事件名                                                 | 说明                                                         | callback参数                             |
| :--- | :----------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| 0    | "diagram.destroy"                                      | 流程编辑器销毁                                               | event:InternalEvent                      |
| 1    | "render.shape"                                         | 调用GraphicsFactory.drawShape时触发，开始渲染形状            |                                          |
| 2    | "render.connection"                                    | 调用GraphicsFactory.drawConnection时触发，开始渲染连线       |                                          |
| 3    | "render.getShapePath"                                  | 调用GraphicsFactory.getShapePath时触发，开始获取形状路径     |                                          |
| 4    | "render.getConnectionPath"                             | 调用GraphicsFactory.getConnectionPath时触发                  |                                          |
| 5    | "diagram.init"                                         | 指示画布已准备好在其上进行绘制                               |                                          |
| 6    | "shape.added"                                          | 已更新到xml内，触发渲染方法，返回值为插入的新元素            | event:InternalEvent, element: Element    |
| 7    | "connection.added"                                     | 已更新到xml内，触发渲染方法，返回值为插入的新元素            | event:InternalEvent, element: Element    |
| 8    | "shape.removed"                                        | 形状移除完成，返回值为被移除元素                             | event:InternalEvent, element: Element    |
| 9    | "connection.removed"                                   | 连线移除完成，返回值为被移除元素                             |                                          |
| 10   | "elements.changed"                                     | 元素发生改变并更改完成                                       | event: InternalEvent, element: Elements  |
| 11   | "diagram.clear"                                        | 流程编辑器元素及画布已清空                                   | event:InternalEvent                      |
| 12   | "canvas.destroy"                                       | 画布销毁                                                     | event:InternalEvent                      |
| 13   | "canvas.init"                                          | 画布初始化完成                                               |                                          |
| 14   | "shape.changed"                                        | 形状属性更新，返回当前元素                                   | event:InternalEvent, element: Element    |
| 15   | "connection.changed"                                   | 连线属性更新，返回当前元素                                   | event:InternalEvent, element: Element    |
| 16   | "interactionEvents.createHit"                          | shape.added,connection.added之后触发                         |                                          |
| 17   | "interactionEvents.updateHit"                          | shape.changed,connection.changed之后触发                     |                                          |
| 18   | "shape.remove"                                         | 形状被选中移除，返回被移除的元素对象                         | event:InternalEvent, element: Element    |
| 19   | "connection.remove"                                    | 连线被选中移除                                               | event:InternalEvent, element: Element    |
| 20   | "element.hover"                                        | 鼠标移动到元素上，返回鼠标位置处元素对象                     | event:InternalEvent, element: Element    |
| 21   | "element.out"                                          | 鼠标移出元素，返回鼠标最近移入的元素对象                     | event:InternalEvent, element: Element    |
| 22   | "selection.changed"                                    | 选中元素变化时，返回新选中的元素对象                         | event:InternalEvent, element: Element    |
| 23   | "create.end"                                           | 从palette中新建的元素创建完成（不清楚为什么有两个相同的参数） | event:InternalEvent, event:InternalEvent |
| 24   | "connect.end"                                          | 从palette中或者从选中节点中新建的连线元素创建完成（不清楚为什么有两个相同的参数） | event:InternalEvent, event:InternalEvent |
| 25   | "shape.move.end"                                       | 形状元素移动结束后                                           | event:InternalEvent, element: Element    |
| 26   | "element.click"                                        | 元素单击事件                                                 | event:InternalEvent, element: Element    |
| 27   | "canvas.viewbox.changing"                              | 视图缩放过程中                                               | event:InternalEvent                      |
| 28   | "canvas.viewbox.changed"                               | 视图缩放完成                                                 | event:InternalEvent, viewbox: Viewbox    |
| 29   | "element.changed"                                      | 元素发生改变时触发，返回发生改变的元素                       | event:InternalEvent, element: Element    |
| 30   | "element.marker.update"                                | 元素标识更新时触发                                           |                                          |
| 31   | "attach"                                               | 画布或者根节点重新挂载时                                     |                                          |
| 32   | "detach"                                               | 画布或者根节点移除挂载时                                     |                                          |
| 33   | "editorActions.init"                                   | 流程编辑模块加载完成                                         |                                          |
| 34   | "keyboard.keydown"                                     | 键盘按键按下                                                 |                                          |
| 35   | "element.mousedown"                                    | 鼠标在元素上按下时触发                                       | event:InternalEvent, element: Element    |
| 36   | "commandStack.connection.start.canExecute"             | 连线开始时检测是否可以创建连线，点击创建连线的按钮时触发     |                                          |
| 37   | "commandStack.connection.create.canExecute"            | 连线开始时检测是否可以创建连线，                             |                                          |
| 38   | "commandStack.connection.reconnect.canExecute"         | 检测连线是否可以修改                                         |                                          |
| 39   | "commandStack.connection.updateWaypoints.canExecute"   | 检测是否可以更新连线拐点                                     |                                          |
| 40   | "commandStack.shape.resize.canExecute"                 | 检测形状是否可以更改大小                                     |                                          |
| 41   | "commandStack.elements.create.canExecute"              | 检测是否可以创建元素                                         |                                          |
| 42   | "commandStack.elements.move.canExecute"                | 检测是否可以移动元素                                         |                                          |
| 43   | "commandStack.shape.create.canExecute"                 | 检测是否可以创建形状                                         |                                          |
| 44   | "commandStack.shape.attach.canExecute"                 | 检测元素是否可以挂载到目标上                                 |                                          |
| 45   | "commandStack.element.copy.canExecute"                 | 检测元素是否可以被复制                                       |                                          |
| 46   | "shape.move.start"                                     | 形状开始移动                                                 | event:InternalEvent, element: Element    |
| 47   | "shape.move.move"                                      | 形状移动过程中                                               | event:InternalEvent, element: Element    |
| 48   | "elements.delete"                                      | 元素被删除，返回被删除的元素                                 | event:InternalEvent, element: Element    |
| 49   | "tool-manager.update"                                  |                                                              |                                          |
| 50   | "i18n.changed"                                         |                                                              |                                          |
| 51   | "drag.move"                                            | 元素拖拽过程中                                               | event:InternalEvent, event:InternalEvent |
| 52   | "contextPad.create"                                    | 当contextPad出现的时候触发                                   | event:InternalEvent, element: Element    |
| 53   | "palette.create"                                       | 左侧palette开始创建                                          |                                          |
| 54   | "autoPlace.end"                                        | 自动对齐结束                                                 |                                          |
| 55   | "autoPlace"                                            | 触发自动对齐方法时                                           |                                          |
| 56   | "drag.start"                                           | 元素拖拽开始                                                 | event:InternalEvent, event:InternalEvent |
| 57   | "drag.init"                                            | 点击了元素即将进行拖拽（包括点击palette和画布内的元素）      | event:InternalEvent, event:InternalEvent |
| 58   | "drag.cleanup"                                         | 元素拖拽结束                                                 | event:InternalEvent, event:InternalEvent |
| 59   | "commandStack.shape.create.postExecuted"               | 当创建形节点的时候触发                                       | event:InternalEvent, event:InternalEvent |
| 60   | "commandStack.elements.move.postExecuted"              | 当元素移动的时候触发                                         | event:InternalEvent, event:InternalEvent |
| 61   | "commandStack.shape.toggleCollapse.postExecuted"       | 当可折叠的节点展开/折叠的时候触发                            | event:InternalEvent, event:InternalEvent |
| 62   | "commandStack.shape.resize.postExecuted"               | 当节点大小发生改变的时候触发                                 | event:InternalEvent, event:InternalEvent |
| 63   | "commandStack.element.autoResize.canExecute"           | 当节点大小发生自动调整的时候触发                             | event:InternalEvent, event:InternalEvent |
| 64   | "bendpoint.move.hover"                                 | 鼠标点击连线折点并进行移动时触发                             | event:InternalEvent, event:InternalEvent |
| 65   | "bendpoint.move.out"                                   | 返回时间不定，可能在拖动时触发，也可能在拖动过程中           | event:InternalEvent, event:InternalEvent |
| 66   | "bendpoint.move.cleanup"                               | 鼠标点击连线折点时或者移动折点完成                           | event:InternalEvent, event:InternalEvent |
| 67   | "bendpoint.move.end"                                   | 鼠标点击连线折点并移动完成                                   | event:InternalEvent, event:InternalEvent |
| 68   | "connectionSegment.move.start"                         | 鼠标选中连线进行拖动开始                                     | event:InternalEvent, event:InternalEvent |
| 69   | "connectionSegment.move.move"                          | 鼠标选中连线进行拖动过程中                                   | event:InternalEvent, event:InternalEvent |
| 70   | "connectionSegment.move.hover"                         | 鼠标选中连线进行拖动开始                                     | event:InternalEvent, event:InternalEvent |
| 71   | "connectionSegment.move.out"                           | 鼠标选中连线，按下鼠标时                                     | event:InternalEvent, event:InternalEvent |
| 72   | "connectionSegment.move.cleanup"                       | 鼠标选中连线后放开鼠标时                                     | event:InternalEvent, event:InternalEvent |
| 73   | "connectionSegment.move.cancel"                        | 选中连线之后取消连接                                         | event:InternalEvent, event:InternalEvent |
| 74   | "connectionSegment.move.end"                           | 选中连线并拖拽结束                                           | event:InternalEvent, event:InternalEvent |
| 75   | "element.mousemove"                                    | 鼠标移除元素后                                               |                                          |
| 76   | "element.updateId"                                     | 更新元素id时触发                                             |                                          |
| 77   | "bendpoint.move.move"                                  | 连线上的拐点被拖拽移动时触发                                 |                                          |
| 78   | "bendpoint.move.start"                                 | 连线上的拐点被拖拽移动开始时触发                             |                                          |
| 79   | "bendpoint.move.cancel"                                | 连线上的拐点被点击并取消拖拽                                 |                                          |
| 80   | "connect.move"                                         | 连线被移动时                                                 |                                          |
| 81   | "connect.hover"                                        |                                                              |                                          |
| 82   | "connect.out"                                          |                                                              |                                          |
| 83   | "connect.cleanup"                                      |                                                              |                                          |
| 84   | "create.move"                                          |                                                              |                                          |
| 85   | "create.hover"                                         |                                                              |                                          |
| 86   | "create.out"                                           |                                                              |                                          |
| 87   | "create.cleanup"                                       |                                                              |                                          |
| 88   | "create.init"                                          |                                                              |                                          |
| 89   | "copyPaste.copyElement"                                |                                                              |                                          |
| 90   | "copyPaste.pasteElements"                              |                                                              |                                          |
| 91   | "moddleCopy.canCopyProperties"                         |                                                              |                                          |
| 92   | "moddleCopy.canCopyProperty"                           |                                                              |                                          |
| 93   | "moddleCopy.canSetCopiedProperty"                      |                                                              |                                          |
| 94   | "copyPaste.pasteElement"                               |                                                              |                                          |
| 95   | "popupMenu.getProviders.bpmn-replace"                  |                                                              |                                          |
| 96   | "contextPad.getProviders"                              |                                                              |                                          |
| 97   | "resize.move"                                          |                                                              |                                          |
| 98   | "resize.end"                                           |                                                              |                                          |
| 99   | "commandStack.shape.resize.preExecute"                 |                                                              |                                          |
| 100  | "spaceTool.move"                                       |                                                              |                                          |
| 101  | "spaceTool.end"                                        |                                                              |                                          |
| 102  | "create.start"                                         |                                                              |                                          |
| 103  | "commandStack.connection.create.postExecuted"          |                                                              |                                          |
| 104  | "commandStack.connection.layout.postExecuted"          |                                                              |                                          |
| 105  | "shape.move.init"                                      |                                                              |                                          |
| 106  | "resize.start"                                         |                                                              |                                          |
| 107  | "resize.cleanup"                                       |                                                              |                                          |
| 108  | "directEditing.activate"                               |                                                              |                                          |
| 109  | "directEditing.resize"                                 |                                                              |                                          |
| 110  | "directEditing.complete"                               |                                                              |                                          |
| 111  | "directEditing.cancel"                                 |                                                              |                                          |
| 112  | "commandStack.connection.updateWaypoints.postExecuted" |                                                              |                                          |
| 113  | "commandStack.label.create.postExecuted"               |                                                              |                                          |
| 114  | "commandStack.elements.create.postExecuted"            |                                                              |                                          |
| 115  | "commandStack.shape.append.preExecute"                 |                                                              |                                          |
| 116  | "commandStack.shape.move.postExecute"                  |                                                              |                                          |
| 117  | "commandStack.elements.move.preExecute"                |                                                              |                                          |
| 118  | "commandStack.connection.create.postExecute"           |                                                              |                                          |
| 119  | "commandStack.connection.reconnect.postExecute"        |                                                              |                                          |
| 120  | "commandStack.shape.create.executed"                   |                                                              |                                          |
| 121  | "commandStack.shape.create.reverted"                   |                                                              |                                          |
| 122  | "commandStack.shape.create.preExecute"                 |                                                              |                                          |
| 123  | "shape.move.hover"                                     |                                                              |                                          |
| 124  | "global-connect.hover"                                 |                                                              |                                          |
| 125  | "global-connect.out"                                   |                                                              |                                          |
| 126  | "global-connect.end"                                   |                                                              |                                          |
| 127  | "global-connect.cleanup"                               |                                                              |                                          |
| 128  | "connect.start"                                        |                                                              |                                          |
| 129  | "commandStack.shape.create.execute"                    |                                                              |                                          |
| 130  | "commandStack.shape.create.revert"                     |                                                              |                                          |
| 131  | "commandStack.shape.create.postExecute"                |                                                              |                                          |
| 132  | "commandStack.elements.create.preExecute"              |                                                              |                                          |
| 133  | "commandStack.elements.create.revert"                  |                                                              |                                          |
| 134  | "commandStack.elements.create.postExecute"             |                                                              |                                          |
| 135  | "commandStack.connection.layout.executed"              |                                                              |                                          |
| 136  | "commandStack.connection.create.executed"              |                                                              |                                          |
| 137  | "commandStack.connection.layout.reverted"              |                                                              |                                          |
| 138  | "commandStack.shape.move.executed"                     |                                                              |                                          |
| 139  | "commandStack.shape.delete.executed"                   |                                                              |                                          |
| 140  | "commandStack.connection.move.executed"                |                                                              |                                          |
| 141  | "commandStack.connection.delete.executed"              |                                                              |                                          |
| 142  | "commandStack.shape.move.reverted"                     |                                                              |                                          |
| 143  | "commandStack.shape.delete.reverted"                   |                                                              |                                          |
| 144  | "commandStack.connection.create.reverted"              |                                                              |                                          |
| 145  | "commandStack.connection.move.reverted"                |                                                              |                                          |
| 146  | "commandStack.connection.delete.reverted"              |                                                              |                                          |
| 147  | "commandStack.canvas.updateRoot.executed"              |                                                              |                                          |
| 148  | "commandStack.canvas.updateRoot.reverted"              |                                                              |                                          |
| 149  | "commandStack.shape.resize.executed"                   |                                                              |                                          |
| 150  | "commandStack.shape.resize.reverted"                   |                                                              |                                          |
| 151  | "commandStack.connection.reconnect.executed"           |                                                              |                                          |
| 152  | "commandStack.connection.reconnect.reverted"           |                                                              |                                          |
| 153  | "commandStack.connection.updateWaypoints.executed"     |                                                              |                                          |
| 154  | "commandStack.connection.updateWaypoints.reverted"     |                                                              |                                          |
| 155  | "commandStack.element.updateAttachment.executed"       |                                                              |                                          |
| 156  | "commandStack.element.updateAttachment.reverted"       |                                                              |                                          |
| 157  | "commandStack.shape.delete.postExecute"                |                                                              |                                          |
| 158  | "commandStack.canvas.updateRoot.postExecute"           |                                                              |                                          |
| 159  | "spaceTool.selection.init"                             |                                                              |                                          |
| 160  | "spaceTool.selection.ended"                            |                                                              |                                          |
| 161  | "spaceTool.selection.canceled"                         |                                                              |                                          |
| 162  | "spaceTool.ended"                                      |                                                              |                                          |
| 163  | "spaceTool.canceled"                                   |                                                              |                                          |
| 164  | "spaceTool.selection.end"                              |                                                              |                                          |
| 165  | "commandStack.shape.delete.postExecuted"               |                                                              |                                          |
| 166  | "commandStack.connection.create.preExecuted"           |                                                              |                                          |
| 167  | "commandStack.shape.replace.preExecuted"               |                                                              |                                          |
| 168  | "bpmnElement.added"                                    |                                                              |                                          |
| 169  | "commandStack.element.updateProperties.postExecute"    |                                                              |                                          |
| 170  | "commandStack或者.label.create.postExecute"            |                                                              |                                          |
| 171  | "commandStack.connection.layout.postExecute"           |                                                              |                                          |
| 172  | "commandStack.connection.updateWaypoints.postExecute"  |                                                              |                                          |
| 173  | "commandStack.shape.replace.postExecute"               |                                                              |                                          |
| 174  | "commandStack.shape.resize.postExecute"                |                                                              |                                          |
| 175  | "shape.move.rejected"                                  |                                                              |                                          |
| 176  | "create.rejected"                                      |                                                              |                                          |
| 177  | "elements.paste.rejected"                              |                                                              |                                          |
| 178  | "commandStack.shape.delete.preExecute"                 |                                                              |                                          |
| 179  | "commandStack.connection.reconnect.preExecute"         |                                                              |                                          |
| 180  | "commandStack.element.updateProperties.postExecuted"   |                                                              |                                          |
| 181  | "commandStack.shape.replace.postExecuted"              |                                                              |                                          |
| 182  | "commandStack.shape.toggleCollapse.executed"           |                                                              |                                          |
| 183  | "commandStack.shape.toggleCollapse.reverted"           |                                                              |                                          |
| 184  | "spaceTool.getMinDimensions"                           |                                                              |                                          |
| 185  | "commandStack.connection.delete.preExecute"            |                                                              |                                          |
| 186  | "commandStack.canvas.updateRoot.preExecute"            |                                                              |                                          |
| 187  | "commandStack.spaceTool.preExecute"                    |                                                              |                                          |
| 188  | "commandStack.lane.add.preExecute"                     |                                                              |                                          |
| 189  | "commandStack.lane.resize.preExecute"                  |                                                              |                                          |
| 190  | "commandStack.lane.split.preExecute"                   |                                                              |                                          |
| 191  | "commandStack.elements.delete.preExecute"              |                                                              |                                          |
| 192  | "commandStack.shape.move.preExecute"                   |                                                              |                                          |
| 193  | "commandStack.spaceTool.postExecuted"                  |                                                              |                                          |
| 194  | "commandStack.lane.add.postExecuted"                   |                                                              |                                          |
| 195  | "commandStack.lane.resize.postExecuted"                |                                                              |                                          |
| 196  | "commandStack.lane.split.postExecuted"                 |                                                              |                                          |
| 197  | "commandStack.elements.delete.postExecuted"            |                                                              |                                          |
| 198  | "commandStack.shape.move.postExecuted"                 |                                                              |                                          |
| 199  | "saveXML.start"                                        |                                                              |                                          |
| 200  | "commandStack.connection.create.preExecute"            |                                                              |                                          |
| 201  | "commandStack.connection.move.preExecute"              |                                                              |                                          |
| 202  | "shape.move.out"                                       |                                                              |                                          |
| 203  | "shape.move.cleanup"                                   |                                                              |                                          |
| 204  | "commandStack.elements.move.preExecuted"               |                                                              |                                          |
| 205  | "commandStack.shape.delete.execute"                    |                                                              |                                          |
| 206  | "commandStack.shape.delete.revert"                     |                                                              |                                          |
| 207  | "spaceTool.selection.start"                            |                                                              |                                          |
| 208  | "spaceTool.selection.move"                             |                                                              |                                          |
| 209  | "spaceTool.selection.cleanup"                          |                                                              |                                          |
| 210  | "spaceTool.cleanup"                                    |                                                              |                                          |
| 211  | "lasso.selection.init"                                 |                                                              |                                          |
| 212  | "lasso.selection.ended"                                |                                                              |                                          |
| 213  | "lasso.selection.canceled"                             |                                                              |                                          |
| 214  | "lasso.ended"                                          |                                                              |                                          |
| 215  | "lasso.canceled"                                       |                                                              |                                          |
| 216  | "lasso.selection.end"                                  |                                                              |                                          |
| 217  | "lasso.end"                                            |                                                              |                                          |
| 218  | "lasso.start"                                          |                                                              |                                          |
| 219  | "lasso.move"                                           |                                                              |                                          |
| 220  | "lasso.cleanup"                                        |                                                              |                                          |
| 221  | "hand.init"                                            |                                                              |                                          |
| 222  | "hand.ended"                                           |                                                              |                                          |
| 223  | "hand.canceled"                                        |                                                              |                                          |
| 224  | "hand.move.ended"                                      |                                                              |                                          |
| 225  | "hand.move.canceled"                                   |                                                              |                                          |
| 226  | "hand.end"                                             |                                                              |                                          |
| 227  | "hand.move.move"                                       |                                                              |                                          |
| 228  | "hand.move.end"                                        |                                                              |                                          |
| 229  | "global-connect.init"                                  |                                                              |                                          |
| 230  | "global-connect.ended"                                 |                                                              |                                          |
| 231  | "global-connect.canceled"                              |                                                              |                                          |
| 232  | "global-connect.drag.ended"                            |                                                              |                                          |
| 233  | "global-connect.drag.canceled"                         |                                                              |                                          |
| 234  | "palette.getProviders"                                 |                                                              |                                          |
| 235  | "propertiesPanel.isEntryVisible"                       |                                                              |                                          |
| 236  | "propertiesPanel.isPropertyEditable"                   |                                                              |                                          |
| 237  | "root.added"                                           |                                                              |                                          |
| 238  | "propertiesPanel.changed"                              |                                                              |                                          |
| 239  | "propertiesPanel.resized"                              |                                                              |                                          |
| 240  | "elementTemplates.changed"                             |                                                              |                                          |
| 241  | "canvas.resized"                                       |                                                              |                                          |
| 242  | "import.parse.complete"                                | 读取模型（xml）完成                                          |                                          |
| 243  | "commandStack.changed"                                 | 发生任意可撤销/恢复操作时触发，可用来实时更新xml             |                                          |

## 四. Moddles

### 1. ElementFactory Diagram元素工厂

用于创建各种Diagram（djs.model）元素，并赋予各种属性。

**使用方式：**

```javascript
const ElementFactory = this.bpmnModeler.get("elementFactory")
```

**方法与返回值：**

```javascript
/**
 * 根据传入参数创建新的元素
 * type："root" | "label" | "connection" | "shape"
 * attrs?: object
 */
ElementFactory.create(type, attrs);
```

**衍生方法：**

根据create方法传入的不同type，衍生了四种创建图形元素的方法。

```javascript
// attrs 非必传参数
ElementFactory.createRoot(attrs);
ElementFactory.createLabel(attrs);
ElementFactory.createConnection(attrs);
ElementFactory.createShape(attrs);
```

#### **Bpmn.js补充方法：**

由于 `diagram.js` 默认只配置了 `Shape, Connection, Root, Label` 四种元素，不足以支撑整个流程编辑器需要的元素类型。所以Bpmn.js在原来的基础上增加了其他方法来定义别的流程元素节点。

```javascript
// 创建bpmn对应的模型元素
// elementType: string
// attrs?: 自定义属性
ElementFactory.createBpmnElement(elementType, attrs)

// 创建参与者
// attrs?: object 自定义属性
ElementFactory.createParticipantShape(attrs)
```



### 2. ElementRegistry 图形注册表

用于追踪所有元素。注入了EventBus事件总线。

**使用方式：**

```javascript
const ElementRegistry = this.bpmnModeler.get("elementRegistry")
```

**方法与返回值：**

```javascript
/**
 * 插入新的注册表
 * @param element：Shape | Connection
 * @param gfx: SVGElement
 * @param secondaryGfx?： SVGElement
 */
ElementRegistry.add(element, gfx, secondaryGfx);

// 移除元素
ElementRegistry.remove(element)

// 更新元素模型的id，同时触发事件'element.updateId'
ElementRegistry.updateId(element, newId)

// 获取对应id的元素模型
ElementRegistry.get(id)

// 根据传入的过滤方法返回符合条件的元素模型数组
ElementRegistry.filter(fn(element, gfx))

// 根据传入的过滤方法返回符合条件的第一个元素模型
ElementRegistry.find(fn(element, gfx))

// 返回所有已渲染的元素模型
ElementRegistry.getAll()

// 遍历所有已渲染元素模型，执行传入方法
ElementRegistry.forEach(fn(element, gfx))

/**
 * 返回对应的SVGElement
 * @param filter：string | Model id或者元素模型
 * @param secondary?: boolean = false 是否返回辅助连接的元素
 */
ElementRegistry.getGraphics(filter, secondary)
```

### 3. GraphicsFactory 图形元素工厂

用于创建可显示的图形元素。注入了EventBus事件总线与ElementRegistry注册表。

> 该类型几乎不直接使用

**使用方式：**

```javascript
const GraphicsFactory = this.bpmnModeler.get("graphicsFactory")
```

**方法与返回值：**

```javascript
/**
 * 返回创建后的SVGElement
 * @param type："shape" | "connection" 元素类型
 * @param element?: SVGElement
 * @param parentIndex?: number 位置
 */
GraphicsFactory.create(type, element, parentIndex)

// 绘制节点，触发"render.shape"
GraphicsFactory.drawShape(visual, element)

// 获取元素的尺寸等，触发"render.getShapePath"
GraphicsFactory.getShapePath(element)

// 绘制连线，触发"render.connection"
GraphicsFactory.drawConnection(visual, element)

// 获取连线的尺寸等，触发"render.getConnectionPath"
GraphicsFactory.getConnectionPath(waypoints)

// 更新元素显示效果(element.type只允许"shape"或者"connaction")
GraphicsFactory.update(element)

GraphicsFactory.remove(element)
```



### 4. Canvas 画布

核心模块之一，处理所有的元素绘制与显示。注入了"canvas.config", "EventBus", "GraphicsFactory", "ElementRegistry"。

**使用方式：**

```
const Canvas = this.bpmnModeler.get("canvas")
```

**内部方法：**

```javascript
/**
 * 画布初始化，根据config配置为svg元素创建一个div class="djs-container"的父容器。并挂载到制定的dom节点上
 * 并在这个div节点下创建一个svg元素，挂载后面所有节点
 * 之后触发"diagram.init"与"canvas.init"
 * 同时注册'shape.added', 'connection.added', 'shape.removed', 'connection.removed', 'elements.changed', 'diagram.destroy', 'diagram.clear'
 * config: object 默认继承实例化BpmnModeler的配置
 */
Canvas._init(config)

/**
 * 画布销毁
 * 触发"canvas.destroy"
 * 删除Canvas内部属性，并移除初始化时声称的dom节点
 */
Canvas._destroy()

/**
 * 按类型创建新的元素对象, 同时触发对应的"[shape | connection].add"和"[shape | connection].added"事件，返回创建的元素对象(衍生的addShape，addConnection方法)
 * @param type: "shape" | "connection" 元素类型
 * @param element: object | djs.model
 * @param parent?: object | djs.model 父元素，默认为根元素对象
 * @param parentIndex?: number 
 * @return element: object | djs.model
 */
Canvas._addElement(type, element, parent, parentIndex)

/**
 * 移除对应的元素, 同时触发对应的"[shape | connection].remove"和"[shape | connection].removed"事件，返回被删除的元素对象(衍生的addShape，addConnection方法)
 * @param type: "shape" | "connection" 元素类型
 * @param element: object | djs.model
 * @param parent?: object | djs.model 父元素，默认为根元素对象
 * @param parentIndex?: number 
 * @return element: object | djs.model
 */
Canvas._removeElement(element, type)
```

**方法与返回值：**

```javascript
// 返回最上层的SVGElement
Canvas.getDefaultLayer()

// 返回用于在其上绘制元素或注释的图层(这个不怎么理解。。。)
Canvas.getLayer(name, index)

// 返回包含画布的Dom节点
Canvas.getContainer()

/**
 * 将标记更新包element上(基本上是css类)，同时触发"element.marker.update", 无返回值
 * @param element：Shape | Connaction | string(元素id)
 * @param marker: string
 */
canvas.addMarker(element, marker)


/**
 * 移除元素上的标记，同时触发"element.marker.update", 无返回值
 * @param element：Shape | Connaction | string(元素id)
 * @param marker: string
 */
canvas.removeMarker(element, marker)

/**
 * 检测元素是否具有某个标记
 * @param element：Shape | Connaction | string(元素id)
 * @param marker: string
 * @return status: boolean
 */
Canvas.hasMarker(element, marker)

/**
 * 切换元素的标记状态，存在即remove，不存在则add
 * @param element：Shape | Connaction | string(元素id)
 * @param marker: string
 */
Canvas.toggleMarker(element, marker)

/**
 * 返回画布的根元素
 * @return element: Object|djs.model
 */
Canvas.getRootElement()

/**
 * 设置新的画布的根元素，返回新的根元素
 * @param element：object | djs.model
 * @param override: boolean 是否要覆盖以前的根元素
 * @return element: Object|djs.model
 */
Canvas.setRootElement(element, override)

/**
 * 添加新的节点（形状）图形元素
 * @param shape: object | djs.model 插入的元素model或者属性配置对象
 * @param parent?: djs.model 父元素，默认根节点（画布下第一级SVG | Root）
 * @param parentIndex?: number 
 * @return Element: djs.model
 */
Canvas.addShape(shape, parent, parentIndex)

/**
 * 添加新的连线元素
 * @param Connaction: object | djs.model 插入的元素model或者属性配置对象
 * @param parent?: djs.model 父元素，默认根节点（画布下第一级SVG | Root）
 * @param parentIndex?: number 
 * @return Element: djs.model
 */
Canvas.addConnection(Connaction, parent, parentIndex)

/**
 * 移除节点元素, 返回被移除的节点
 * @param shape： string | djs.model 节点id或者model
 * @return element: djs.model
 */
Canvas.removeShape(shape)

/**
 * 移除连线元素, 返回被移除的对象
 * @param shape： string | djs.model 节点id或者model
 * @return element: djs.model
 */
Canvas.removeConnaction(connection)

/**
 * 查询图形元素的SVGElement，即 ElementRegistry.getGraphics()方法。
 * @param shape： string | djs.model 节点id或者model
 * @param secondary?： boolean 
 * @return element: SVGElement
 */
Canvas.getGraphics(element, secondary)

/**
 * 获取或者设置新的画布的视图框。该方法的getter可能会返回一个缓存中的viewbox（如果当前时刻视图正在发生改变）
 * 如果要强制重新计算，请先执行Canvas.viewbox(false)
 * @param box: Box 新的视图框配置
 * @param box.x: number = 0 视图框可见的画布区域在x轴坐标（原点左上角）
 * @param box.y: number = 0 视图框可见的画布区域在y轴坐标（原点左上角）
 * @param box.width: number 视图框可见宽度
 * @param box.height: number 视图框可见高度
 * @return box 当前视图区域
 */
Canvas.viewbox(box)

/**
 * 具有滚动条时调整滚动位置
 * @param delta：Delta 新的滚动位置
 * @param delta.dx：number x轴方向的位移大小
 * @param delta.dy：number y轴方向的位移大小
 * @return
 */
Canvas.scroll(delta)

/**
 * 设置新的缩放比例或者中心位置，返回当前的缩放比例
 * @param newScale?： number 新的缩放比例
 * @param center?： Point | "auto" | null
 * @param center.x: number
 * @param center.y: number
 * @return scale: number
 */
Canvas.zoom(newScale, center)

// 主动触发"canvas.resized"事件
Canvas.resized()

// 返回画布元素的大小
Canvas.getSize()

// 返回画布的绝对边界
// @return BBox {
// 		x: x;
// 		y: y;
// 		width: width;
// 		height: height;
// }
Canvas.getAbsoluteBBox()
```

### 5. EventBus 事件总线

核心模块之一，通用事件总线， 该组件用于跨图实例进行通信。 图的其他部分可以使用它来侦听和广播事件。

**使用方式：**

```
const EventBus = this.bpmnModeler.get("eventBus");
```

**核心方法：**

```javascript
/**
 * 注册事件监听器
 * @param events: string | string[] 事件名称（s）
 * @param priority?: number 优先级，默认1000
 * @param callback: Function 回调函数
 * @param that?: object 上下文中的this，会将其传递给callback
 */
EventBus.on(events, priority, callback, that)
 
/**
 * 注册只执行一次的事件监听器
 * @param events: string | string[] 事件名称（s）
 * @param priority?: number 优先级，默认1000
 * @param callback: Function 回调函数
 * @param that?: object 上下文中的this，会将其传递给callback
 */
EventBus.once(events, priority, callback, that)
 
/**
 * 关闭、删除事件监听器
 * @param events
 * @param callback
 */
EventBus.off(events, callback)
 
/**
 * 创建一个可以让EventBus识别的事件，并返回这个事件
 * @param data: object
 * @return event: object
 */
EventBus.createEvent(data)

/**
 * 主动触发事件
 * @param type: string | object 事件名称/嵌套事件名称的对象（{type： string}）
 * @param data: any 传递给回调函数的参数 
 * @return status: boolean | any 事件返回值（如果指定）；如果侦听器阻止了默认操作，则返回false
 */
EventBus.fire(type, data)
```

### 6. InternalEvent 事件

指通过事件总线发出来的事件实例。

```javascript
/**
 * A event that is emitted via the event bus.
 */
function InternalEvent() { }

// 阻止事件传播给其他接收者
InternalEvent.prototype.stopPropagation = function() {
  this.cancelBubble = true;
};

// 阻止事件的默认结果
InternalEvent.prototype.preventDefault = function() {
  this.defaultPrevented = true;
};

InternalEvent.prototype.init = function(data) {
  assign(this, data || {});
};
```

事件可以结合事件总线对事件监听器做自定义处理。

比如：

```javascript
EventBus.on("foo", function(event) {
    console.log(event.type) // "foo"
    event.stopPropagation(); // 停止事件继续传播
    event.preventDefault(); // 阻止事件原来的返回值，返回false
})

// 传入自定义信息
const payload = { fooPayload: "foo" }
EventBus.on("foo", function(event, payload) {
    console.log(payload) // { fooPayload: "foo" }
})
```

