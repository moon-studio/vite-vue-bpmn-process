## 四. Modules

### 7. Modeling 基本建模方法

`Diagram.js` 提供的基础建模工厂 `BaseModeling`，注入了 `EventBus, ElementFactory, CommandStack` 模块实例。`Bpmn.js` 继承了 `BaseModeling` 并提供了新的方法。

**该模块在自定义节点属性等方面经常使用**

#### **使用方式**

```javascript
const Modeling = this.bpmnModeler.get("modeling");
```

`Modeling` 初始化时会向 `CommandStack` 命令堆栈中注册对应的处理程序，以确保操作可恢复和取消。

`Modeling` 提供的方法主要是根据 `handlers` 来定义的，每个方法会触发对应的事件

```javascript
// BaseModeling (diagram.js)
BaseModeling.prototype.getHandlers = function () {
    var BaseModelingHandlers = {
        'shape.append': AppendShapeHandler, // 形状可逆添加到源形状的处理程序
        'shape.create': CreateShapeHandler, // 形状可逆创建、添加到流程中的处理程序
        'shape.delete': DeleteShapeHandler, // 形状可逆移除的处理程序
        'shape.move': MoveShapeHandler, // 形状可逆移动的处理程序
        'shape.resize': ResizeShapeHandler, // 形状可逆变换大小的处理程序
        'shape.replace': ReplaceShapeHandler, // 通过添加新形状并删除旧形状来替换形状。 如果可能，将保持传入和传出连接
        'shape.toggleCollapse': ToggleShapeCollapseHandler, // 切换元素的折叠状态及其所有子元素的可见性
        'spaceTool': SpaceToolHandler, // 通过移动和调整形状、大小、连线锚点(巡航点)来添加或者删除空间
        'label.create': CreateLabelHandler, // 创建标签并附加到特定的模型元素上
        'connection.create': CreateConnectionHandler, // 创建连线，并显示到画布上
        'connection.delete': DeleteConnectionHandler, // 移除连线
        'connection.move': MoveConnectionHandler, // 实现连接的可逆移动的处理程序。 该处理程序与布局连接处理程序的不同之处在于它保留了连接布局
        'connection.layout': LayoutConnectionHandler, // 实现形状的可逆移动的处理程序
        'connection.updateWaypoints': UpdateWaypointsHandler, // 更新锚点(巡航点)
        'connection.reconnect': ReconnectConnectionHandler, // 重新建立连接关系
        'elements.create': CreateElementsHandler, // 元素可逆创建的处理程序
        'elements.move': MoveElementsHandler, // 元素可逆移动的处理程序
        'elements.delete': DeleteElementsHandler, // 元素可逆移除的处理程序
        'elements.distribute': DistributeElementsHandler, // 均匀分配元素布局的处理程序
        'elements.align': AlignElementsHandler, // 以某种方式对齐元素
        'element.updateAttachment': UpdateAttachmentHandler // 实现形状的可逆附着/分离的处理程序。
    }
    return BaseModelingHandlers;
}

// Modeling (bpmn.js)
var ModelingHandlers = BaseModeling.prototype.getHandlers.call(this);

ModelingHandlers['element.updateModdleProperties'] = UpdateModdlePropertiesHandler; // 实现元素上的扩展属性的可逆修改
ModelingHandlers['element.updateProperties'] = UpdatePropertiesHandler; // 实现元素上的属性的可逆修改
ModelingHandlers['canvas.updateRoot'] = UpdateCanvasRootHandler; // 可逆更新画布挂载节点
ModelingHandlers['lane.add'] = AddLaneHandler; // 可逆通道添加
ModelingHandlers['lane.resize'] = ResizeLaneHandler; // 通道可逆resize
ModelingHandlers['lane.split'] = SplitLaneHandler; // 通道可逆分隔
ModelingHandlers['lane.updateRefs'] = UpdateFlowNodeRefsHandler; // 可逆更新通道引用
ModelingHandlers['id.updateClaim'] = IdClaimHandler;
ModelingHandlers['element.setColor'] = SetColorHandler; // 可逆更新元素颜色
ModelingHandlers['element.updateLabel'] = UpdateLabelHandler; // 可逆更新元素label
```

#### **提供方法**

```javascript
const Modeling = this.bpmnModeler.get("modeling");


// 获取当前拥有的处理程序
Modeling.getHandlers()

/**
 * 更新元素的label标签，同时触发 element.updateLabel 事件
 * @param element: ModdleElement
 * @param newLabel: ModdleElement 新的标签元素
 * @param newBounds: {x: number；y: number; width: number; height: number} 位置及大小
 * @param hints?：{} 提示信息
 */
Modeling.updateLabel(element, newLabel, newBounds, hints);

/**
 * 创建新的连接线，触发 connection.create 事件
 * 会在内部调用 createConnection() 方法（Modeling.prototype.createConnection -- in diagram.js）
 * @param source：ModdleElement 源元素
 * @param target：ModdleElement 目标元素
 * @param attrs?: {} 属性，未传时会根据规则替换成对应的对象，主要包含连线类型 type
 * @param hints?: {} 
 * @return Connection 连线实例
 */
Modeling.connect(source, target, attrs, hints)

/**
 * 更新元素扩展属性，同时触发 element.updateModdleProperties
 * @param element 目标元素
 * @param moddleElement 元素扩展属性对应的实例
 * @param properties 属性
 */
Modeling.updateModdleProperties(element, moddleElement, properties)

/**
 * 更新元素属性，同时触发 element.updateProperties
 * @param element 目标元素
 * @param properties 属性
 */
Modeling.connect(element, properties)

/**
 * 泳道(通道)事件，会触发对应的事件 lane.resize
 */
Modeling.resizeLane(laneShape, newBounds, balanced)

/**
 * 泳道(通道)事件，会触发对应的事件 lane.add
 */
Modeling.addLane(targetLaneShape, location)

/**
 * 泳道(通道)事件，会触发对应的事件 lane.split
 */
Modeling.splitLane(targetLane, count)

/**
 * 将当前图转换为协作图
 * @return Root
 */
Modeling.makeCollaboration()

/**
 * 将当前图转换为一个过程
 * @return Root
 */
Modeling.makeProcess()

/**
 * 修改目标元素color，同时触发 element.setColor 事件
 * @param elements: ModdleElment || ModdleElement[] 目标元素
 * @param colors：{[key: string]: string} svg对应的css颜色属性对象
 */
Modeling.setColor(elements, colors)
```

#### `BaseModeling` 提供方法

`BaseModeling` 为 `diagram.js` 提供的基础方法，也可以直接调用未被 `bpmn.js` 覆盖的方法。

```javascript
// 向命令堆栈注册处理程序
Modeling.registerHandlers(commandStack)

// 移动 Shape 元素到新元素下， 触发shape.move
Modeling.moveShape(shape, delta, newParent, newParentIndex, hints)

// 移动多个 Shape 元素到新元素下， 触发 elements.move
Modeling.moveElements(shapes, delta, target, hints)

// 移动 Connection 元素到新元素下， 触发 connection.move
Modeling.moveConnection(connection, delta, newParent, newParentIndex, hints)

// 移动 Connection 元素到新元素下， 触发 connection.move
Modeling.layoutConnection(connection, hints)


/**
 * 创建新的连线实例，触发 connection.create
 * @param source: ModdleElement
 * @param target: ModdleElement
 * @param parentIndex?: number
 * @param connection: ModdleElement | Object 连线实例或者配置的属性对象
 * @param parent：ModdleElement 所在的元素的父元素 通常为 Root
 * @param hints: {}
 * @return Connection 新的连线实例
 */
Modeling.createConnection(source, target, parentIndex, connection, parent, hints)

/**
 * 创建新的图形实例，触发 shape.create
 * @param shape
 * @param position
 * @param target
 * @param parentIndex
 * @param hints
 * @return Shape 新的图形实例
 */
Modeling.createShape(shape, position, target, parentIndex, hints)

/**
 * 创建多个元素实例，触发 elements.create
 * @param
 * @param
 * @return Elements 实例数组
 */
Modeling.createElements(elements, position, parent, parentIndex, hints)

/**
 * 为元素创建 label 实例， 触发 label.create
 * @param labelTarget: ModdleElement 目标元素
 * @param position: { x: number; y: number }
 * @param label：ModdleElement label 实例
 * @param parent: ModdleElement
 * @return Label
 */
Modeling.createLabel(labelTarget, position, label, parent)

/**
 * 将形状附加到给定的源，在源和新创建的形状之间绘制连接。触发 shape.append
 * @param source: ModdleElement
 * @param shape: ModdleElement | Object
 * @param position: { x: number; y: number }
 * @param target: ModdleElement
 * @param hints
 * @return Shape 形状实例
 */
Modeling.appendShape(source, shape, position, target, hints)

/**
 * 移除元素，触发 elements.delete
 * @param elements: ModdleElement[]
 */
Modeling.removeElements(elements)

/**
 * 不太了解
 */
Modeling.distributeElements(groups, axis, dimension)

/**
 * 移除元素, 触发 shape.delete
 * @param shape： ModdleElement
 * @param hints?: object
 */
Modeling.removeShape(shape, hints)

/**
 * 移除连线, 触发 connection.delete
 * @param connection： ModdleElement
 * @param hints?: object
 */
Modeling.removeConnection(connection, hints)

/**
 * 更改元素类型(替换元素)，触发 shape.replace
 * @param oldShape：ModdleElement
 * @param newShape：ModdleElement
 * @param hints?: object
 * @return Shape 替换后的新元素实例
 */
Modeling.replaceShape(oldShape, newShape, hints)

/**
 * 对其选中元素，触发 shape.replace
 * @param elements: ModdleElement[]
 * @param alignment: Alignment
 * @return
 */
Modeling.alignElements(elements, alignment)

/**
 * 调整形状元素大小，触发 shape.resize
 * @param shape: ModdleElement
 * @param newBounds
 * @param minBounds
 * @param hints?: object
 */
Modeling.resizeShape(shape, newBounds, minBounds, hints)

/**
 * 切换元素展开/收缩模式，触发 shape.toggleCollapse
 * @param shape?: ModdleElement
 * @param hints?: object=
 */
Modeling.toggleCollapse(shape, hints)

// 连线调整的方法
Modeling.reconnect(connection, source, target, dockingOrPoints, hints)

Modeling.reconnectStart(connection, newSource, dockingOrPoints, hints)

Modeling.reconnectEnd(connection, newTarget, dockingOrPoints, hints)

// 手动连线
Modeling.connect(source, target, attrs, hints)
```

### 8. Draw 绘制模块

基础的元素绘制方法，由 `diagram.js` 提供基础模块，源码如下：

```javascript
// diagram.js/lib/draw/index.js
import DefaultRenderer from './DefaultRenderer';
import Styles from './Styles';

export default {
  __init__: [ 'defaultRenderer' ],
  defaultRenderer: [ 'type', DefaultRenderer ],
  styles: [ 'type', Styles ]
};
```

其中 `DefaultRenderer` 为默认元素绘制方法，继承 `BaseRenderer` ，自身包含 `CONNECTION_STYLE --连线默认样式`, `FRAME_TYLE -- 框架默认样式` 和 `SHAPE_STYLE -- 元素默认样式` 三个样式属性。

`Styles` 为样式管理组件，包含 `cls -- 根据属性、样式名等来定义样式`, `style -- 根据属性计算样式` 和 `computeStyle -- 样式计算方法` 三个方法。

> `BaseRenderer` 是一个抽象类，只定义了方法和绘制时的触发事件，没有定义方法的具体实现。

#### `Styles` 样式管理（`diagram.js`）

根据源码的思路，这个模块只推荐重写，即修改默认的类名与样式配置。

```javascript
// diagram.js/lib/draw/Styles.js
import { isArray, assign, reduce } from 'min-dash';

/**
 * A component that manages shape styles
 */
export default function Styles() {

  var defaultTraits = {
    'no-fill': {
      fill: 'none'
    },
    'no-border': {
      strokeOpacity: 0.0
    },
    'no-events': {
      pointerEvents: 'none'
    }
  };
  var self = this;

  /**
   * Builds a style definition from a className, a list of traits and an object of additional attributes.
   *
   * @param  {string} className
   * @param  {Array<string>} traits
   * @param  {Object} additionalAttrs
   *
   * @return {Object} the style defintion
   */
  this.cls = function(className, traits, additionalAttrs) {
    var attrs = this.style(traits, additionalAttrs);
    return assign(attrs, { 'class': className });
  };

  /**
   * Builds a style definition from a list of traits and an object of additional attributes.
   *
   * @param  {Array<string>} traits
   * @param  {Object} additionalAttrs
   *
   * @return {Object} the style defintion
   */
  this.style = function(traits, additionalAttrs) {
    if (!isArray(traits) && !additionalAttrs) {
      additionalAttrs = traits;
      traits = [];
    }
    var attrs = reduce(traits, function(attrs, t) {
      return assign(attrs, defaultTraits[t] || {});
    }, {});
    return additionalAttrs ? assign(attrs, additionalAttrs) : attrs;
  };

  this.computeStyle = function(custom, traits, defaultStyles) {
    if (!isArray(traits)) {
      defaultStyles = traits;
      traits = [];
    }
    return self.style(traits || [], assign({}, defaultStyles, custom || {}));
  };
}
```

#### `DefaultRenderer` 默认绘制方法（`diagram.js`）

> 源码位置：`diagram-js/lib/draw/DefaultRenderer.js`

继承了 `diagram.js/BaseRenderer` ，注入 `eventBus` `styles` 模块，并且默认绘制方法的处理优先级最低，在有其他绘制方法的时候会被覆盖。

`BaseRenderer` 提供了一个抽象基类，并且提供了 `canRender() , getShapePath(), getConnecttionPath(), drawShape(), DrawConnection()` 五个抽象方法，定义了方法触发时刻。

```javascript
eventBus.on([ 'render.shape', 'render.connection' ], renderPriority, function(evt, context) {
    var type = evt.type,
        element = context.element,
        visuals = context.gfx;
    if (self.canRender(element)) {
        if (type === 'render.shape') {
            return self.drawShape(visuals, element);
        } else {
            return self.drawConnection(visuals, element);
        }
    }
});
eventBus.on([ 'render.getShapePath', 'render.getConnectionPath'], renderPriority, function(evt, element) {
    if (self.canRender(element)) {
        if (evt.type === 'render.getShapePath') {
            return self.getShapePath(element);
        } else {
            return self.getConnectionPath(element);
        }
    }
});
```

`DefaultRenderer` 重写了以上五个方法（`canRender()` 直接返回了 `true`， 表示任何情况都可以绘制和渲染元素），实现默认元素和样式的解析渲染。

方法说明：

1. `canRender()`: 判断方法，返回一个布尔值，为真时表示可以继续解析元素属性（位置、大小、形状等）或者继续渲染属性。
2. `getShapePath(shape)`: 元素（默认是方形元素）属性解析方法。
3. `getConnectionPath(connection)`: 连线属性解析方法。
4. `drawShape(visuals, element)`: 元素（默认是方形元素）绘制方法。
5. `drawConnection(visuals, connection)`: 连线绘制方法。

--------------------------------- 分割线 -------------------------------------

> `bpmn.js` 继承 `diagram.js/BaseRenderer` 定义了一个 `BpmnRender` 类，并针对 `bpmn 2.0` 流程需要的其他元素做了新的处理。

`bpmn.js` 为了实现 `bpmn 2.0` 流程图的支持，不仅重新定义了新的渲染方法类 `BpmnRenderer, TextRender, PathMap`，以保证图形元素的正常解析，以及 `label` 的便捷添加修改。

```javascript
import BpmnRenderer from './BpmnRenderer';
import TextRenderer from './TextRenderer';
import PathMap from './PathMap';

export default {
  __init__: [ 'bpmnRenderer' ],
  bpmnRenderer: [ 'type', BpmnRenderer ],
  textRenderer: [ 'type', TextRenderer ],
  pathMap: [ 'type', PathMap ]
};
```

#### `BpmnRenderer` 流程元素绘制方法

支持 `bpmn 2.0` 的流程元素的基础绘制方法，继承 `BaseRender`，注入了 `config, eventBus, styles, pathMap, canvas, textRenderer` 模块。源码位于 `bpmn-js/lib/draw/BpmnRenderer.js`，共1900+行（其中1200+行都在定义绘制各种元素的方法）。

`BpmnRenderer` 只实现了基类的4个抽象方法（`getConnectionPath()` 方法没有使用，由此可见其实 `bpmn-js` 内部的连线元素也是当做了 `shape` 类型来进行处理的，毕竟有个箭头，也可能存在折线的情况），并且没有新增方法。但是在 `canRender()` 方法里判断了需要渲染的元素是否属于 `bpmn:BaseElement` 类型。

```javascript
BpmnRenderer.prototype.canRender = function(element) {
      return is(element, 'bpmn:BaseElement'); // 从解析文件 bpmn.json 其实可以发现，所有需要渲染的元素最终都继承了 Bpmn:BaseElement
};
```

在 `getShapePath()` 方法中，对属于 `bpmnEvent（事件类节点，例如开始和结束等事件，显示为圆形）`，`bpmn:Activity（任务类节点，包含子流程类型的节点，显示为圆角矩形）`，`bpmn:Gateway（网关类型，显示为菱形）` 三个大类型的节点定义的对应的路径获取方法，其他类型则沿用与 `diagram.js/DefaultRenderer.js` 里面使用的 `getRectPath()` 方法。

`drawShape()` 与 `drawConnection()` 方法则是判断了需要渲染的元素类型，调用对应的 `handler()` 方法也处理（也就是上面说的那1200+行代码），通过 `handlers` 对象（所有 `handler()` 方法的集合，以各类型的类型名作为 `key`），可以发现可显示的元素一共有60种：

```
0: "bpmn:Event"
1: "bpmn:StartEvent"
2: "bpmn:MessageEventDefinition"
3: "bpmn:TimerEventDefinition"
4: "bpmn:EscalationEventDefinition"
5: "bpmn:ConditionalEventDefinition"
6: "bpmn:LinkEventDefinition"
7: "bpmn:ErrorEventDefinition"
8: "bpmn:CancelEventDefinition"
9: "bpmn:CompensateEventDefinition"
10: "bpmn:SignalEventDefinition"
11: "bpmn:MultipleEventDefinition"
12: "bpmn:ParallelMultipleEventDefinition"
13: "bpmn:EndEvent"
14: "bpmn:TerminateEventDefinition"
15: "bpmn:IntermediateEvent"
16: "bpmn:IntermediateCatchEvent"
17: "bpmn:IntermediateThrowEvent"
18: "bpmn:Activity"
19: "bpmn:Task"
20: "bpmn:ServiceTask"
21: "bpmn:UserTask"
22: "bpmn:ManualTask"
23: "bpmn:SendTask"
24: "bpmn:ReceiveTask"
25: "bpmn:ScriptTask"
26: "bpmn:BusinessRuleTask"
27: "bpmn:SubProcess"
28: "bpmn:AdHocSubProcess"
29: "bpmn:Transaction"
30: "bpmn:CallActivity"
31: "bpmn:Participant"
32: "bpmn:Lane"
33: "bpmn:InclusiveGateway"
34: "bpmn:ExclusiveGateway"
35: "bpmn:ComplexGateway"
36: "bpmn:ParallelGateway"
37: "bpmn:EventBasedGateway"
38: "bpmn:Gateway"
39: "bpmn:SequenceFlow"
40: "bpmn:Association"
41: "bpmn:DataInputAssociation"
42: "bpmn:DataOutputAssociation"
43: "bpmn:MessageFlow"
44: "bpmn:DataObject"
45: "bpmn:DataObjectReference"
46: "bpmn:DataInput"
47: "bpmn:DataOutput"
48: "bpmn:DataStoreReference"
49: "bpmn:BoundaryEvent"
50: "bpmn:Group"
51: "label"
52: "bpmn:TextAnnotation"
53: "ParticipantMultiplicityMarker"
54: "SubProcessMarker"
55: "ParallelMarker"
56: "SequentialMarker"
57: "CompensationMarker"
58: "LoopMarker"
59: "AdhocMarker"
```

具体的实现方法，有兴趣的童鞋可以自行查看。

> 要实现自定义 `renderer` ，本质也是定义一个自己的渲染函数类，继承 `BaseRenderer`，然后修改原型链上的方法，使生成的渲染方法实例每次调用 `drawShape()` 或者 `drawConnection()` 等方法的时候都调用自定义的绘制方法（这里必须重新实现基类 `BaseRenderer` 的几个方法，否则不生效）。

#### `TextRenderer` 文本元素绘制方法

源码位于 `bpmn-js/lib/draw/TextRenderer.js`，主要实现了文字元素（即 `Label` 标签）的渲染与显示，通过获取绑定节点的位置和大小，在对应的位置生成一个 `text` 标签来显示文本。可通过重写该函数类来实现自定义的文本位置控制。

#### `PathMap` SVG元素路径对象

包含 `BpmnRenderer` 所需的SVG路径的函数，内部有一个 `pathMap` 对象，保存了所有的元素的 svg 路径、默认大小。

### 9. AlignElements 元素对齐

`diagram.js` 模块，注入模块 `Modeling`。主要用作元素对齐。

> 会按照元素对齐方向的边界对齐。

**使用：**

```javascript
const AlignElements = this.bpmnModeler.get("alignElements");

/**
 * Executes the alignment of a selection of elements
 * 执行元素选择的对齐
 *
 * @param  {Array} elements 通常为节点元素
 * @param  {string} type 可用：left|right|center|top|bottom|middle
 */
AlignElements.trigger(Elements, type);
```

**改写：**

```javascript
// index.js
import CustomElements from './CustomElements';

export default {
  __init__: [ 'customElements' ],
  customElements: [ 'type', CustomElements ]
};

// CustomElements.js
import inherits from 'inherits';
import AlignElements from 'diagrem-js/lib/features/align-elements/AlignElements';

export default function CustomElements(modeling) {
  this._modeling = modeling;
}

inherits(CustomElements, AlignElements);

CustomElements.$inject = [ 'modeling' ];

CustomElements.prototype.trigger = function(elements, type) {
    // 对齐逻辑
}
```



### 10. AttachSupport 依附支持

`diagram.js` 模块，注入模块 `injector, eventBus, canvas, rules, modeling`，依赖规则模块 `rulesModule`。主要用作元素移动期间的绑定关系和预览。

> 基础逻辑模块，不推荐更改，也不提供直接使用的方法。



### 11. AutoPlace 元素自动放置

将元素自动放置到合适位置（默认在后方，正后方存在元素时向右下偏移）并调整连接的方法。通常在点击 `contentPad` 创建新元素的时候触发。

注入基础模块 `eventBus` 与 `modeling`。

> 默认会初始化一个放置后选中元素的方法。

**使用：**

```javascript
const AutoPlace = this.bpmnModeler.get("autoPlace");

/**
 * Append shape to source at appropriate position.
 * 将形状添加的源对应的合适位置
 * 会触发 autoPlace.start autoPlace autoPlace.end 三个事件
 *
 * @param {djs.model.Shape} source ModdleElement
 * @param {djs.model.Shape} shape ModdleElement
 *
 * @return {djs.model.Shape} appended shape
 */
AutoPlace.append(source, shape, hints);
```



### 12. AutoResize 元素大小调整

一个自动调整大小的组件模块，用于在创建或移动子元素接近父边缘的情况下扩展父元素。

注入模块 `eventBus, elementRegistry, modeling, rules`

> 暂时没找到怎么直接调用

**重写/禁用：**

```javascript
// 重写
// index.js
import AutoResize from './AutoResize';

export default {
  __init__: [ 'autoResize' ],
  autoResize: [ 'type', AutoResize ]
  // 禁用直接设置 autoResize: [ 'type', "" ] 或者 autoResize: [ 'type', （） => false ]
};

// AutoResize.js
export default function AutoResize(eventBus, elementRegistry, modeling, rules) {
    // ...
}

AutoResize.$inject = [
  'eventBus',
  'elementRegistry',
  'modeling',
  'rules'
];

inherits(AutoResize, CommandInterceptor); // CommandInterceptor 向commandStack中插入命令的原型。
```

### 13. AutoScroll 画布滚动

 画布自动扩展滚动的方法，如果当前光标点靠近边框，则开始画布滚动。 当当前光标点移回到滚动边框内时取消或手动取消。

依赖于 `DraggingModule` ，注入模块 `eventBus, canvas`

> 函数原型上传入了 `config` ，但打印为 `undefined`

**使用与方法：**

```javascript
const AutoScroll = this.modeler.get("autoScroll");

/**
 * Starts scrolling loop.
 * 开始滚动
 * Point is given in global scale in canvas container box plane.
 *
 * @param  {Object} point { x: X, y: Y }
 */
AutoScroll.startScroll(point);

// 停止滚动
AutoScroll.stopScroll();

/**
 * 覆盖默认配置
 * @param {Object} options 
 * options.scrollThresholdIn: [ 20, 20, 20, 20 ],
 * options.scrollThresholdOut: [ 0, 0, 0, 0 ],
 * options.scrollRepeatTimeout: 15,
 * options.scrollStep: 10
 */
AutoScroll.setOptions(options);
```

