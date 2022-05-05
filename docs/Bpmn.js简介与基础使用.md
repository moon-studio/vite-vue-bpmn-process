## 1. Bpmn.js简介

> 📌BPMN (Business Process Model and Notation): 业务流程模型和标记法，是对象管理组织维护的关于业务流程建模的行业性标准。目标是通过提供一套既符合业务人员直观又能表现复杂流程语义的标记法，同时为技术人员和业务人员从事业务流程管理提供支持。
> 

[Bpmn.js: BPMN 2.0 rendering toolkit and web modeler](https://bpmn.io/toolkit/bpmn-js/).  Create, embed and extend BPMN diagrams in your Browser. 

由 Camunda 团队研发的一个 BPMN 2.0渲染工具包和web建模器。使得可以在浏览器中创建、嵌入和扩展 BPMN 流程图。

采用JavaScript编写，包含一个基础的查看器，与“增强”后的建模器，可以嵌入到任何web应用程序中（需要 web 程序支持 SVG 绘制，比如旧版 IE 浏览器就不行）。



Bpmn.js 内部依赖 [diagram.js](https://github.com/bpmn-io/diagram-js) 和 [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle) 。

<img src="https://gitee.com/MiyueSC/image-bed/raw/master/image-20220217162633617.png" alt="image-20220217162633617" style="zoom:67%;" />

其中 diagram.js 是一个用于在web应用程序中显示和修改图表的工具库，为 bpmn.js 提供了基础的图形元素交互方法，以及覆盖物、工具栏、ContentPad等基础工具和撤销恢复的操作命令栈。

[bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle)了解[BPMN 2.0 标准](http://www.omg.org/spec/BPMN/2.0/)中定义的 BPMN 2.0 元模型。它允许我们读取和写入符合 BPMN 2.0 规范的 XML 文档，并访问图表上绘制的形状和连接背后的 BPMN 相关信息。

## 2. Diagram.js与Bpmn Moddle

### 2.1 Diagram.js

> 📌[diagram-js](https://github.com/bpmn-io/diagram-js) is a toolbox for displaying and modifying diagrams on the web. It allows us to render visual elements and build interactive experiences on top of them.Additionally, diagram-js defines a data model for graphical elements and their relationships.
>
> 译：diagram.js是一个用于在web应用程序上显示和修改图表的工具集合，它允许我们渲染可见元素并在此基础上提供交互。此外，diagram.js还为图形元素及其关系定义了一个数据模型。



**Module System**

diagram.js 使用依赖注入(DI)来连接和查找图形组件，在一个模块函数的上下文中，如果该模块需要引用其他服务/工具的实例来完成相应的工作，可以根据模块函数引用的服务/工具函数名来传递对应的实例对象引用。

比如以下函数使用 EventBus 来进行工作：

```javascript
// 第一步：编写函数执行逻辑
// 函数参数顺序需要与注入依赖的顺序一致
const MyLoggingPlugin = (eventBus) => {
  eventBus.on('element.changed', (event) => {
    console.log('element ', event.element, ' changed');
  });
}

// 注入该函数引用的依赖模块实例（采用小驼峰命名）
MyLoggingPlugin.$inject = [ 'eventBus' ];



// 第二步：将功能函数作为一个模块发布出来
import CoreModule from 'diagram-js/lib/core';

// export as module
export default {
  __depends__: [ CoreModule ], // 依赖diagram.js核心模块
  __init__: [ 'myLoggingPlugin' ], // 表示在图表初始化时执行
  myLoggingPlugin: [ 'type', MyLoggingPlugin ] // 告诉外部DI架构该模块的名称
};



// 第三步：使用
const diagram = new Diagram({
  modules: [
    MyLoggingModule
  ]
});
```

> 🚀要将模块插入到 bpmn.js 中，可以使用 `additionalModules` 选项。	

```javascript
import BpmnModeler from "bpmn-js/lib/Modeler"

const modeler = new BpmnModeler({
  // ...
  additionalModules: [MyLoggingModule]
})
```



**Core Services**

也可以看做是 diagram.js 的核心模块（Core Module），主要包含以下五个模块

- [`Canvas`](https://github.com/bpmn-io/diagram-js/blob/master/lib/core/Canvas.js) - 提供用于添加和删除图形元素的API；处理元素生命周期并提供缩放和滚动等API。
- [`EventBus`](https://github.com/bpmn-io/diagram-js/blob/master/lib/core/EventBus.js) - 事件总线模块，可以自由添加和移除事件监听，或者主动触发某些订阅事件；该模块可以让我们脱离模块内部逻辑来实现某些特殊逻辑。
- [`ElementFactory`](https://github.com/bpmn-io/diagram-js/blob/master/lib/core/ElementFactory.js) - 根据diagram.js的内部数据模型创建形状和连接关系的工厂函数。
- [`ElementRegistry`](https://github.com/bpmn-io/diagram-js/blob/master/lib/core/ElementRegistry.js) - 记录所有图形元素的注册表函数，并提供根据ID查找元素模型实例的API。
- [`GraphicsFactory`](https://github.com/bpmn-io/diagram-js/blob/master/lib/core/GraphicsFactory.js) - 负责创建形状和连线的SVG元素。其实际的外观和形状是由渲染器定义的，即绘制模块( Draw Module )中的DefaultRenderer。



**Data Model**

diagram.js 在内部创建了一个关于形状和连线的基础数据模型。

- 形状（Shape）：包含父元素，子元素列表，连接的目标形状列表和源形状对象列表
- 连线（Connection）：包含父元素，来源形状和目标形状

`ElementRegistry` 负责根据该模型创建形状和连接。在建模期间，通过 `Modeling` 基础建模服务来根据用户操作更新元素关系。



**Auxiliary Services**

其他辅助模块，即除了数据模型与核心模块之外的其他工具模块，包括：

- [`CommandStack`](https://github.com/bpmn-io/diagram-js/blob/master/lib/command/CommandStack.js) - 在建模期间负责重做和撤销。
- [`ContextPad`](https://github.com/bpmn-io/diagram-js/blob/master/lib/features/context-pad/ContextPad.js) - 提供元素的上下文操作。
- [`Overlays`](https://github.com/bpmn-io/diagram-js/blob/master/lib/features/overlays/Overlays.js) - 提供用于将附加信息附加到图表元素的API。
- [`Modeling`](https://github.com/bpmn-io/diagram-js/blob/master/lib/features/modeling/Modeling.js) - 提供用于更新画布上的元素（移动、删除）的API。
- [`Palette`](https://github.com/bpmn-io/diagram-js/blob/master/lib/features/palette/Palette.js)
- ...

> 📌Bpmn.js 的 Modeling 模块在此基础上进行了拓展，提供的API更多。

### 2.2 Bpmn Moddle

Bpmn Moddle 封装了BPMN 2.0元模型，并为我们提供了读写BPMN 2.0 XML文档的方法。

导入XMl的时候，可以将XML文档转换为JavaScript对象树。在用户进行编辑时验证XML模型的合法性，并将结果保存后转换为BPMN 2.0 XML。



## 3. Bpmn.js（Plugging Things Together）

将 Diagram.js 与 Bpmn Module 结合到一起，在添加 BPMN 规范对应的元素类型与元素形状和相关规则，就得到了 Bpmn.js 。

当我们导入BPMN 2.0文档（通常文件后缀是xml或者bpmn）时，BPMN模块会将其从XML解析到对象树中。bpmn.js 会根据解析得到的对象树将所有元素和连线呈现在画布中。一个BPMN元素的对象实例主要包含以下内容：

```javascript
{
  id: 'StartEvent_1',
  x: 100,
  y: 100,
  width: 50,
  height: 50,
  businessObject: {
    $attrs: Object
    $parent: {
      $attrs: Object
      $parent: ModdleElement
      $type: 'bpmn:Process'
      flowElements: Array[1]
      id: 'Process_1'
      isExecutable: false
    }
    $type: 'bpmn:StartEvent'
    id: 'StartEvent_1'
  }
}
```

其中 `businessObject` 属性的内容为核心内容，可以通过其访问到所有元素的基础BPMN属性。

Bpmn.js 的元素外观渲染主要通过 BpmnRenderer 模块，我们还可以通过重写该模块实现元素的自定义显示。

在导入XML模型结束之后，也可以通过 BpmnRules 模块来创建或者更改一些建模操作。



Bpmn.js 提供了三种不同的模式供我们使用，我们可以根据不同的业务场景来选择对应的模式：

- [`Viewer`](https://github.com/bpmn-io/bpmn-js/blob/master/lib/Viewer.js) 仅显示和查看 BPMN 图表
- [`NavigatedViewer`](https://github.com/bpmn-io/bpmn-js/blob/master/lib/NavigatedViewer.js) 引入了鼠标操作和键盘事件的查看器
- [`Modeler`](https://github.com/bpmn-io/bpmn-js/blob/master/lib/Modeler.js) 提供完整的建模方法和交互操作

另外还有两种基础模式：

- BaseViewer：Viewer的上级构造方法，基于 Diagram.js ，提供导入导出、清空销毁等方法。
- BaseModeler：Modeler的上级构造方法，继承 BaseViewer，只增加了一个私有的moddle和一个私有的id处理方法。

> 🚀 通常在仅需要提供基础的BPMN流程查看功能时，可以使用 Viewer 模式，否则更推荐使用 Modeler 模式。



## 4. 基础使用

### 4.1 可见组成部分

在未引入其他插件的情况下，使用 `Modeler` 模式，生产的画布可见功能主要包含以下部分：

1. `Palette`：左侧元素工具栏，可以通过点击或者拖拽触发添加新元素
2. `Shape`s：所有 Bpmn.js 可见节点，Moddle 描述文件内可发现均继承自 `Element`
3. `Connection`s：所有节点之间的连线，Bpmn.js 中连线的类型均为 `SequenceFlow`
4. `ContentPad`：用鼠标选中一个元素时会出现，主要是操作该元素的上下文以及节点自身的类型等
5. `PopupMenu`：默认在鼠标点击 `ContentPad` 中的扳手图表时出现，主要用于控制选中元素类型的调整等

![image-20220217144955968](https://gitee.com/MiyueSC/image-bed/raw/master/image-20220217144955968.png)

> 悄悄抄了一下呆呆的图，原图见：https://juejin.cn/post/6844904017584193544#heading-1

### 4.2 引入 Bpmn.js

在node环境下，可以使用 npm 进行安装。

```shell
npm install bpmn-js
```

或者使用 cdn 方式引入依赖。

```html
<script src="https://unpkg.com/bpmn-js@8.9.1/dist/bpmn-modeler.production.min.js"></script>
```

> 🚩 需要使用其他模式或者压缩格式时，可以在 [Unpkg/bpmn-js](https://unpkg.com/browse/bpmn-js@8.9.1/dist/) 查找需要的版本和模式对应 cdn 地址。



### 4.3 实例化建模器

首先，需要创建一个 Dom 节点来挂载画布元素。

```html
<div id="bpmn-canvas"></div>
```

之后，引入 Modeler 并实例化建模器。

```javascript
import BpmnModeler from "bpmn-js/lib/Modeler"
import 'bpmn-js/dist/assets/diagram-js.css' // 基础样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css' // 节点基础图标
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css' // 节点完整图标

this.bpmnModeler = new BpmnModeler({
  container: "#bpmn-canvas",
  keyboard: { bindTo: document } // 使用键盘快捷键
});
```



### 4.4 导入流程图

最后，导入一个预设的 xml 字符串（**该 xml 必须包含一个 process 节点，否则无法创建新元素**）

```javascript
async createNewDiagram(xml) {
  // 将字符串转换成图显示出来
  let newId = this.processId || `Process_${new Date().getTime()}`;
  let newName = this.processName || `业务流程_${new Date().getTime()}`;
  let xmlString = xml || DefaultEmptyXML(newId, newName, this.prefix);
  try {
    let { warnings } = await this.bpmnModeler.importXML(xmlString);
    if (warnings && warnings.length) {
      warnings.forEach(warn => console.warn(warn));
    }
  } catch (e) {
    console.error(`[Process Designer Warn]: ${e?.message || e}`);
  }
},
  
// DefaultEmptyXML 方法见 https://github.com/miyuesc/bpmn-process-designer/blob/main/package/designer/plugins/defaultEmpty.js
```

### 4.5 引入侧边栏

`Camunda` 团队内部实现了属性侧边栏 [bpmn-js-properties-panel](https://github.com/bpmn-io/bpmn-js-properties-panel)，同时包含了最基础的 Bpmn 属性版本，以及适配 `Camunda` 流程引擎的完整属性版本。



使用方式如下：

**1. 添加一个空div放置侧边栏**

```html
<div class="modeler">
  <div id="canvas"></div> <!-- 画布区域 -->
  <div id="properties"></div> <!-- 侧边栏区域 -->
</div>
```

**2. 引入侧边栏**

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule, // 基础侧边栏渲染入口
  BpmnPropertiesProviderModule, // 侧边栏属性编辑表单构造器
} from 'bpmn-js-properties-panel';
import 'bpmn-js-properties-panel/assets/element-templates.css' // 侧边栏样式

const modeler = new BpmnModeler({
  container: '#canvas',
  propertiesPanel: {
    parent: '#properties' // 侧边栏挂载的 Dom Id
  },
  // 添加到扩展模块内
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule
  ]
});
```

**3. 使用效果**

![image-20220217152604153](https://gitee.com/MiyueSC/image-bed/raw/master/image-20220217152604153.png)

> 🚀 更新后的版本，UI 更加好看？！

### 4.6 导出流程图文件

Bpmn.js 内部已实现了导出为 SVG 格式图片或者 XML 文本的方法。

> `.bpmn` 与 `.xml` 文件内部都是一样的数据，只是导出文件格式稍有区别

```javascript
/** 下载流程图到本地
 * @param {string} type 下载的文件格式，包含 xml, bpmn, svg
 * @param {string} name 下载的文件名字
 */
async downloadProcess(type, name) {
  try {
    const _this = this;
    // 按需要类型创建文件并下载
    if (type === "xml" || type === "bpmn") {
      const { err, xml } = await this.bpmnModeler.saveXML();
      // 读取异常时抛出异常
      if (err) {
        console.error(`[Process Designer Warn ]: ${err.message || err}`);
      }
      let { href, filename } = _this.setEncoded(type.toUpperCase(), name, xml);
      downloadFunc(href, filename);
    } else {
      const { err, svg } = await this.bpmnModeler.saveSVG();
      // 读取异常时抛出异常
      if (err) {
        return console.error(err);
      }
      let { href, filename } = _this.setEncoded("SVG", name, svg);
      downloadFunc(href, filename);
    }
  } catch (e) {
    console.error(`[Process Designer Warn ]: ${e.message || e}`);
  }
  // 文件下载方法
  function downloadFunc(href, filename) {
    if (href && filename) {
      let a = document.createElement("a");
      a.download = filename; //指定下载的文件名
      a.href = href; //  URL对象
      a.click(); // 模拟点击
      URL.revokeObjectURL(a.href); // 释放URL 对象
    }
  }
},
```

## 5. 进阶使用

### 5.1 切换为 `Flowable` 或者 `Activiti`

首先，在切换了适配的流程引擎后，第4节中提到的 `Camunda` 团队开发的侧边栏就不能用了，需要重写侧边栏。

然后，需要编写流程引擎对应的 `Moddle` 描述文件，然后在实例化 `Modeler` 的时候引入，基础引入方式如下：

```javascript
// 引入描述文件
import activitiModdleExtension from "./plugins/extension-moddle/activiti.json";
import flowableModdleExtension from "./plugins/extension-moddle/flowable.json";

import BpmnModeler from "bpmn-js/lib/Modeler";

// ...
// 实例化
this.bpmnModeler = new BpmnModeler({
  container: this.$refs["bpmn-canvas"],
  keyboard: { bindTo: document },
  // 在这里引入对应的描述文件
  moddleExtensions: {
    activiti: activitiModdleExtension, // 使用的哪个引擎就引入哪个，不需要两个都引入
    flowable: flowableModdleExtension
  }
});
```

相关文件可以参考 [https://github.com/miyuesc/bpmn-process-designer/tree/main/package/designer/plugins/descriptor](https://github.com/miyuesc/bpmn-process-designer/tree/main/package/designer/plugins/descriptor) ，但是需要与后端确认属性版本。

也可以根据文件规则进行简化或者重写，具体规则见：[Bpmn.js描述文件说明](https://juejin.cn/post/6912331982701592590)





## 后语

该文档简述bpmn的主要构成与基础使用，各模块详细说明与使用文档见 [BPMN专栏](https://juejin.cn/column/6964382482007490590)。

另有基于 Vue 2  的演示项目 Bpmn Process Designer： [github](https://github.com/miyuesc/bpmn-process-designer)，  [gitee](https://gitee.com/miyuesc/bpmn-process-designer)

## 参考资料

- [bpmn-js/walkthrough](https://bpmn.io/toolkit/bpmn-js/walkthrough/)
- [全网最详bpmn.js教材-基础篇](https://juejin.cn/post/6844904017584193544)
