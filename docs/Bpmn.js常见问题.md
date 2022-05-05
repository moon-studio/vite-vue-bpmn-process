# bpmn.js 常见问题

[TOC]

## 1. 创建/更新元素属性，或者导出文件时报错 cannot read property 'isGeneric'

![输入图片说明](https://images.gitee.com/uploads/images/2021/0525/163440_35aff760_1832158.png)

原因：

常见于 Vue 2.x 项目。由于更新时 Bpmn 接收的参数类型应该为 `ModdleElement` 类型，但是在编写组件时将对应的数据保存进了 `data() { return { } }` 的某个数据中，所以被 vue 进行了响应式处理，更改了原型与属性，导致无法解析。

解决：

在 `data () { }` 中使用 _ 或者 $ 符号作为开头，或者不在 data 中进行声明直接对 this 进行赋值，可避免被响应式处理。

## 2. 导入xml或者创建新标签/属性时报错 Uncaught Error: unknown type [xxx:xxx](xxx:xxx)

![输入图片说明](https://images.gitee.com/uploads/images/2021/0525/165606_bb16a8c3_1832158.png)

原因：

当前选用的表述文件（一个 json 文件， 比如该项目中 package/process-designer/plugins/descriptor/ 下的三个文件）不支持该标签/属性

解决：

根据需要的标签/属性类型，在对应的描述文件类增加对应的标签/属性。具体描述文件格式参见 [bpmn 自定义解析文件](https://gitee.com/MiyueSC/blog/blob/master/bpmn/docs/自定义解析文件.md)

## 3. 更改元素/连线颜色

### 3.1. modeler 模式

直接使用 `modeling.setColor(els, option)` 方法更改元素颜色或者其他属性。

### 3.2. viewer 模式

1. 使用 `canvas.addMarker(elId, marker)` 为元素添加一个 class 类名，之后为该类添加 css 样式。
2. 使用 `overlays.add(elId, option)` 为元素添加一个遮罩层，为遮罩层添加 css 样式。

viewer 模式下的方式在 modeler 模式也可以使用。

## 4. 隐藏 [bpmn.io](http://bpmn.io) 画布 logo

添加全局样式

```CSS
a.bjs-powered-by {
    display: none
}
```

> 📌注意：虽然 bpmn.js 为开源项目，但是作者要求不能隐藏该组织 logo，所以请各位在开发时尽量保留该内容。

## 5. 阻止 contentPad 删除事件

根据 bpmn 官方论坛的一些解决方案，添加 bpmnlint 规则可能并不能在点击删除按钮之后进行删除操作之前阻止元素被删除。所以要在点击 删除按钮之后根据条件判断是否进行删除，可以重写 contentPad 的删除功能。

### 5.1 定义 customContentPad

创建 `CustomContentPadProvider.js`

```javascript
class CustomContextPadProvider {
  constructor(contextPad, rules, modeling, translate) {
    contextPad.registerProvider(this);

    this._rules = rules;
    this._modeling = modeling;
    this._translate = translate;
  }
}

CustomContextPadProvider.$inject = [
  "contextPad",
  "rules",
  "modeling",
  "translate"
];

export default {
  __init__: ["customContextPadProvider"],
  customContextPadProvider: ["type", CustomContextPadProvider]
};
```

### 5.2 定义新的删除规则

在定义新的规则之前，需要删除原有的删除规则。

```javascript
// 在 CustomContextPadProvider 类中定义 getContextPadEntries 方法
class CustomContextPadProvider {
  // ...
  
  // 传入参数为当前的选中元素
  getContextPadEntries(element) {
    const rules = this._rules;
    const translate = this._translate;
    const modeling = this._modeling;
    
    // entries 为原有的 contentPad 操作列表
    return function (entries) {
      // 1. 编写删除判断逻辑
      const deleteAllowed = true;
      
      // 2. 删除原来的 delete 操作
      delete entries["delete"];
      
      // 3. 插入自定义的删除操作按钮
      entries["delete"] = {
        group: "edit",
        className: "bpmn-icon-trash",
        title: translate("Remove"),
        action: {
          click: function (event) {
            if (!deleteAllowed) {
              alert("This is not allowed!");
            } else {
              modeling.removeElements([element]);
            }
          }
        }
      }
      
      // 4. 返回 contentPad 操作按钮
      return entries;
    }
  }
}
```

### 5.3 在初始化 modeler 时引入自定义的 contentPad

```javascript
import Modeler from "bpmn-js/lib/Modeler";
import customContextPadProviderModule from "./CustomContextPadProvider";

const container = document.getElementById("container");

const modeler = new Modeler({
  container,
  additionalModules: [customContextPadProviderModule],
  keyboard: {
    bindTo: document
  }
});
```

## 6. 自定义 Module 时无法渲染

> 🚩 这个问题主要出现在我的个人开源项目 [bpmn-process-designer](https://github.com/miyuesc/bpmn-process-designer) 中，现已禁用原有功能。

**主要问题：**

在页面加载时出现无法正常初始化组件的情况，流程编辑器BpmnModeler实例无法正常实例化。

主要问题也能在错误信息中发现，在自定义palette时发生错误，无法正常找到自定义侧边栏 customPalette。

![image-20210720160511276](https://gitee.com/MiyueSC/image-bed/raw/master/image-20210720160511276.png)

**原因：**

在自定义palette的构造函数的时候，继承了原生的 paletteProvider，但是没有注入依赖实例，导致实例化时无法找到依赖的其他实例对象。

**解决：**

在自定义 paletteProvider 中添加依赖注入

```javascript
import PaletteProvider from "bpmn-js/lib/features/palette/PaletteProvider";

export default function CustomPalette(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate) {
  PaletteProvider.call(this, palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate, 2000);
}

// 注入依赖
CustomPalette.$inject = ["palette", "create", "elementFactory", "spaceTool", "lassoTool", "handTool", "globalConnect", "translate"];
```

> 🚀 注意：注入的依赖顺序需要和传入构造函数的参数顺序一致。

## 7. 判断连线元素 Connection 状态

连线默认共三种状态：默认路径、普通路径、条件路径。

1. 普通路径：`businessObject` 对象内 **不包含** `conditionExpression` 属性，来源节点 `default` 属性不指向该路径
2. 默认路径：`businessObject` 对象内 **不包含** `conditionExpression` 属性，来源节点 `default` 属性不指向该路径实例，体现在 xml 上为来源节点会增加一个 `default` 属性，属性值为路径id
3. 条件路径：`businessObject` 对象内 **包含** `conditionExpression` 属性

## 8. 使用 Modeler 实现仅查看的功能

```JavaScript
new BpmnModeler({
  additionalModules: [
    {
      // 禁用左侧默认工具栏
      paletteProvider: ['value', '']// 去不干净，还是默认生成空白 dom
      // 禁用滚轮(画布)滚动缩放
      zoomScroll: ['value', ''],
      // 禁止拖动线
      bendpoints: ['value', ''],
      // 禁止点击节点出现contextPad
      contextPadProvider: ['value', ''],
      // 禁止双击节点出现label编辑框
      labelEditingProvider: ['value', ''],
  		// 禁止画布移动
  		moveCanvas: ['value', ''],
  		// 禁止单个元素移动
  		move: ['value', ''],
    }
  ]
})
```

## 9. 左侧侧边栏增加分割线（原生样式）

在原生侧边栏基础上进行自定义更改，然后在 `additionalModules` 内插入该组件。

1. 编写自定义侧边栏 `CustomPalette.js`

   ![img](https://gitee.com/MiyueSC/image-bed/raw/master/image.png)

   > 📌 `getPaletteEntries` 会返回一个由侧边栏所有可见元素对象组成的 `actions` 对象。

   ![img](https://secure2.wostatic.cn/static/rVaWL6sPA5zkFgSDRa1SMJ/image.png?auth_key=1640139454-i8FK7hnEvtzVattPAtU6pV-0-7d1d20d48deffc890e9f052084a4cd5f&image_process=format,webp)

   > 📌 每个操作对象包含以下几个属性: 
   >
   > 1. group：分组
   > 2. className：图标类名
   > 3. title：元素title
   > 4. action： 一个对象，包含鼠标事件对应的操作方法组成的对象，键名为事件名；常用有 click，dragstart
   > 5. separator：boolean 值，表示是否是一个分割线，会根据 group 属性的值插入该分组下方 

2. 编写`index.js` 入口文件

   ```javascript
   // custom/index.js
   import CustomPalette from "./CustomPalette";
   
   export default {
     __init__: ["customPalette"],
     customPalette: ["type", CustomPalette]
   };
   ```

   

3. 使用

   ```javascript
   import CustomPaletteProvider from "../package/designer/plugins/palette";
   
   this.bpmnModeler = new BpmnModeler({
           container: this.$refs["bpmn-canvas"],
           additionalModules: [CustomPaletteProvider]
         });
   ```

## 10. 自定义侧边栏

自定义侧边栏时，可以先用 css 样式隐藏原生侧边栏，或者使用一下方法取消实例化时的侧边栏组件实例化。

```javascript
this.bpmnModeler = new BpmnModeler({
        container: this.$refs["bpmn-canvas"],
        additionalModules: [
          paletteProvider: ["value", ""]
        ]
      });
```

之后，可以仿照原生侧边栏的定义方式，通过自定义鼠标事件的方法来定义自己的侧边栏元素效果。

以下为Vue单文件实现方式：

```vue
<template>
	<div class="my-process-palette">
    <div class="test-button" @click="addTask" @mousedown="addTask">测试任务</div>
  </div>
</template>

<script>
import { assign } from "min-dash";

export default {
  name: "MyProcessPalette",
  data() {
  },
  methods: {
    addTask(event, options = {}) {
      // window.bpmnInstances 内的内容可以参见项目 BpmnProcessDesigner 下的 processPenal 组件
      const ElementFactory = window.bpmnInstances.elementFactory;
      const create = window.bpmnInstances.modeler.get("create");

      console.log(ElementFactory, create);

      const shape = ElementFactory.createShape(assign({ type: "bpmn:UserTask" }, options));

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }
  }
};
```

## 11. 阻止双击事件编辑label

> 🚀 这个情况也适用于阻止单击显示contextPad等等情况。

第一种方式：

自定义事件监听方法，设置更高的权重，并返回 null

```javascript
const eventBus = modeler.get("eventBus");
eventBus.on("element.dblclick", 3000, function(context) {
  // 如果不返回null或者undefined，或者别的返回值。如果不设置返回值，可能不会起到阻止该事件继续执行的作用
  return null;
});
```

第二种方式：

改写该 label 编辑构造器的构造方法。

```javascript
this.bpmnModeler = new BpmnModeler({
  container: this.$refs["bpmn-canvas"],
  additionalModules: [
    { labelEditingProvider: ["value", ""] }
  ]
});
```

## 12. 实例化时报错：Error: No provider for "xxx" (Resolving: xxx)

这种情况一般发生在改写原生的Provider方法，或者自定义新的插件构造方法的时候出现。主要原因是因为没有在构造方法下注入该方法实例与其他插件的依赖关系。

处理方法如下：

```javascript
// 以自定义构造方法为例
export default function CustomPalette(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate) {
  // ...
}
CustomPalette.$inject = ["palette", "create", "elementFactory", "spaceTool", "lassoTool", "handTool", "globalConnect", "translate"]
```

> 🚩 特别注意：构造函数使用的参数顺序必须与注入的依赖数组顺序一致。

## 13. 直接获取 Process 元素

```javascript
const canvas = modeler.get("canvas");

const rootElement = canvas.getRootElement();

console.log("Process Id:", rootElement.id);
```

## 14. 节点resize改变大小

> 已有仓库实现基础节点的resize功能 [bpmn-js-task-resize](https://github.com/ElCondor1969/bpmn-js-task-resize)

使用：

```javascript
import BpmnModeler from 'bpmn-js/lib/Modeler';

import resizeTask from 'bpmn-js-task-resize/lib';

var bpmnJS = new BpmnModeler({
  additionalModules: [
    resizeTask
  ],
  taskResizingEnabled: true, // 允许任务类节点resize
  eventResizingEnabled: true // 允许开始结束等事件类节点resize
});
```

## 15. 子流程节点的手动展开/收起

```javascript
const modeling = modeler.get("modeling");

// bpmnElement 为选中的子流程元素
modeling.toggleCollapse(this.bpmnElement);
```

## 16. 无法拖入元素

![错误图片](https://gitee.com/MiyueSC/image-bed/raw/master/image-20220211164505735.png)



这个错误通常出现在初始化时没有导入空白流程元素，插入节点元素时需要已存在一个空白 Process，可以在初始化 Modeler 完成后传入一个xml字符串。

```javascript
// defaultEmpty.js
export default (key, name, type) => {
  if (!type) type = "camunda";
  const TYPE_TARGET = {
    activiti: "http://activiti.org/bpmn",
    camunda: "http://bpmn.io/schema/bpmn",
    flowable: "http://flowable.org/bpmn"
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="diagram_${key}"
  targetNamespace="${TYPE_TARGET[type]}">
  <bpmn2:process id="${key}" name="${name}" isExecutable="true">
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${key}">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;
};


// app.vue
import BpmnModeler from "bpmn-js/lib/Modeler";
import DefaultEmptyXML from "./plugins/defaultEmpty";

export default {
  // ...
  mounted() {
    this.bpmnModeler = new BpmnModeler({
        container: this.$refs["bpmn-canvas"]
      });
    this.createNewDiagram();
  },
  methods: {
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
  }
}
```

