<div align="center">
    <h1>Vite Vue Bpmn Process Editor</h1>
    <br />
    <a href="https://github.com/moon-studio/vite-vue-bpmn-process/blob/main/README.md">English</a> | 中文
    <br />
</div>

## Description

Vite Vue Bpmn流程编辑器，基于[Bpmn.js](https://github.com/bpmn-io/bpmn-js)， [Vite](https://vitejs.dev)， [Vue.js 3.x](https://vuejs.org/)。

实现了Bpmn.js和Diagram.js的typescript类型声明，typescript可以用来在编辑器中编写代码。

## Friendship sponsorship

生活不易，偷偷丢个码。如果对您有帮助，您可以请我喝杯咖啡。十分感谢~ ~ ~ ~

<img alt="微信" src="/public/wechat.jpg" width="240" style="display: inline-block"/>
<img alt="支付宝" src="/public/alipay.png" width="240" style="display: inline-block"/>


## Directory

```
|-- public
|-- src
|   |-- bo-utils                                   businessObject 相关属性处理函数
|   |-- components                                 组件 与 bpmn.js 自定义模块
|       |-- AddiModules                            bpmn.js 自定义模块（扩展与重写）
|       |-- Designer                               流程设计器
|       |-- ModdleExtensions                       bpmn.js 扩展解析文件
|       |-- Palette                                重写的 bpmn.js 的 Palette 组件
|       |-- Penal                                  重写的 bpmn.js 的 Penal 组件
|       |-- Setting                                项目配置表单组件
|       |-- Toolbar                                编辑器工具栏组件
|   |-- config                                     项目配置文件
|   |-- styles
|       |-- camunda-penal.scss                     camunda 官方侧边栏样式
|       |-- context-pad.scss                       bpmn.js 上下文菜单样式（扩展部分）
|       |-- designer.scss                          流程设计器样式
|       |-- index.scss                             项目样式统一入口
|       |-- palette.scss                           bpmn.js 的 Palette 组件样式（扩展部分）
|       |-- penal.scss                             bpmn.js 的 Penal 组件样式（重写penal）
|       |-- setting.scss                           项目配置表单样式
|       |-- toolbar.scss                           编辑器工具栏样式
|   |-- utils
|       |-- EmptyXML.ts                            生成空的 XML 文件
|       |-- EventEmitter.ts                        事件发布订阅器
|       |-- files.ts                               文件相关操作
|       |-- index.ts                               常用工具函数
|       |-- Logger.ts                              控制台日志输出美化
|       |-- storage.ts                             本地存储操作
|       |-- tools.ts                               常用工具函数
|       |-- uuid.ts                                uuid 生成器
|   |-- App.vue
|   |-- main.ts
|   |-- env.d.ts
|-- types
|   |-- bpmn-moddle
|   |-- declares
|       |-- bpmn.d.ts                              bpmn.js 的类型声明文件
|       |-- bpmn-moddle.d.ts                       bpmn.js 的 moddle 类型声明文件
|       |-- camunda-bpmn-moddle.d.ts               camunda 官方 moddle 类型声明文件
|       |-- diagram.d.ts                           diagram.js 的类型声明文件
|       |-- diagram-js-direct-editing.d.ts         diagram.js 的双击编辑类型声明文件
|       |-- didi.d.ts                              [Nikku - didi](https://github.com/nikku/didi/blob/master/lib/index.d.ts)
|       |-- moddle.d.ts                            moddle 的类型声明文件
|   |-- editor
|-- LICENSE
|-- README.md
|-- tsconfig.json
|-- package.json
|-- vite.config.js
```


> 
> Activiti moddle json: https://github.com/Activiti/activiti-modeling-app/blob/master/projects/process-editor/src/services/activiti.json

