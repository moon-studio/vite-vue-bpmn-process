import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider'
import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory.js'
import { assign } from 'min-dash'

class EnhancementPaletteProvider extends PaletteProvider {
  private readonly _palette: PaletteProvider
  private readonly _create: any
  private readonly _elementFactory: ElementFactory
  private readonly _spaceTool: any
  private readonly _lassoTool: any
  private readonly _handTool: any
  private readonly _globalConnect: any
  private readonly _translate: any
  constructor(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate) {
    super(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate, 2000)
    this._palette = palette
    this._create = create
    this._elementFactory = elementFactory
    this._spaceTool = spaceTool
    this._lassoTool = lassoTool
    this._handTool = handTool
    this._globalConnect = globalConnect
    this._translate = translate
  }
  getPaletteEntries() {
    const actions = {},
      create = this._create,
      elementFactory = this._elementFactory,
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

    assign(actions, {
      'create.exclusive-gateway': createAction(
        'bpmn:ExclusiveGateway',
        'gateway',
        'bpmn-icon-gateway-none',
        translate('Create Gateway')
      ),
      'create.parallel-gateway': createAction(
        'bpmn:ParallelGateway',
        'gateway',
        'bpmn-icon-parallel-gateway-none',
        translate('Create Parallel Gateway')
      ),
      'create.event-base-gateway': createAction(
        'bpmn:EventBasedGateway',
        'gateway',
        'bpmn-icon-event-base-gateway-none',
        translate('Create Event Based Gateway')
      ),
      'gateway-separator': {
        group: 'gateway',
        separator: true
      },
      'create.user-task': createAction(
        'bpmn:UserTask',
        'activity',
        'bpmn-icon-user-task',
        translate('Create User Task')
      ),
      'task-separator': {
        group: 'activity',
        separator: true
      }
    })

    return actions
  }
}

export default EnhancementPaletteProvider
