import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider'
import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory.js'
import { assign } from 'min-dash'

class RerenderPaletteProvider extends PaletteProvider {
  private readonly _palette: PaletteProvider
  private readonly _create: any
  private readonly _elementFactory: ElementFactory
  private readonly _spaceTool: any
  private readonly _lassoTool: any
  private readonly _handTool: any
  private readonly _globalConnect: any
  private readonly _translate: any
  constructor(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect) {
    super(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, 2000)
    this._palette = palette
    this._create = create
    this._elementFactory = elementFactory
    this._spaceTool = spaceTool
    this._lassoTool = lassoTool
    this._handTool = handTool
    this._globalConnect = globalConnect
  }
  getPaletteEntries() {
    const actions = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool,
      handTool = this._handTool,
      globalConnect = this._globalConnect,
      translate = this._translate

    function createAction(type: string, group: string, className: string, title: string, options?: Object) {
      function createListener(event) {
        const shape = elementFactory.createShape(assign({ type: type }, options))

        if (options) {
          !shape.businessObject.di && (shape.businessObject.di = {})
          shape.businessObject.di.isExpanded = (options as { [key: string]: any }).isExpanded
        }

        create.start(event, shape)
      }

      const shortType = type.replace(/^bpmn:/, '')

      return {
        group: group,
        className: className,
        title: title || translate('Create {type}', { type: shortType }),
        action: {
          dragstart: createListener,
          click: createListener
        }
      }
    }
    function createSubprocess(event) {
      const subProcess = elementFactory.createShape({
        type: 'bpmn:SubProcess',
        x: 0,
        y: 0,
        isExpanded: true
      })

      const startEvent = elementFactory.createShape({
        type: 'bpmn:StartEvent',
        x: 40,
        y: 82,
        parent: subProcess
      })

      create.start(event, [subProcess, startEvent], {
        hints: {
          autoSelect: [startEvent]
        }
      })
    }

    assign(actions, {
      'hand-tool': {
        group: 'tools',
        className: 'bpmn-icon-hand-tool',
        title: '手型工具',
        action: {
          click: function (event) {
            handTool.activateHand(event)
          }
        }
      },
      'lasso-tool': {
        group: 'tools',
        className: 'bpmn-icon-lasso-tool',
        title: '套索工具',
        action: {
          click: function (event) {
            lassoTool.activateSelection(event)
          }
        }
      },
      'global-connect-tool': {
        group: 'tools',
        className: 'bpmn-icon-connection-multi',
        title: '全局连线',
        action: {
          click: function (event) {
            globalConnect.toggle(event)
          }
        }
      },
      'tool-separator': {
        group: 'tools',
        separator: true
      },
      'create.exclusive-gateway': createAction('bpmn:ExclusiveGateway', 'gateway', 'bpmn-icon-gateway-none', '网关'),
      'create.parallel-gateway': createAction(
        'bpmn:ParallelGateway',
        'gateway',
        'bpmn-icon-gateway-parallel',
        '并行网关'
      ),
      'create.event-base-gateway': createAction(
        'bpmn:EventBasedGateway',
        'gateway',
        'bpmn-icon-gateway-eventbased',
        '事件网关'
      ),
      'gateway-separator': {
        group: 'gateway',
        separator: true
      },
      'create.user-task': createAction('bpmn:UserTask', 'activity', 'bpmn-icon-user-task', '用户任务'),
      'create.script-task': createAction('bpmn:ScriptTask', 'activity', 'bpmn-icon-script-task', '脚本任务'),
      'create.service-task': createAction('bpmn:ServiceTask', 'activity', 'bpmn-icon-service-task', '服务任务'),
      'create.subprocess-expanded': {
        group: 'activity',
        className: 'bpmn-icon-subprocess-expanded',
        title: '子流程',
        action: {
          dragstart: createSubprocess,
          click: createSubprocess
        }
      }
    })

    return actions
  }
}

export default RerenderPaletteProvider
