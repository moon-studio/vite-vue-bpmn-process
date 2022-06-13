import { assign } from 'min-dash'

export function createAction(
  elementFactory,
  create,
  type: string,
  group: string,
  className: string,
  title: string,
  options?: Object
) {
  function createListener(event) {
    const shape = elementFactory.createShape(assign({ type: type }, options))

    if (options) {
      !shape.businessObject.di && (shape.businessObject.di = {})
      shape.businessObject.di.isExpanded = (options as { [key: string]: any }).isExpanded
    }

    create.start(event, shape)
  }

  return {
    group: group,
    className: className,
    title: title,
    action: {
      dragstart: createListener,
      click: createListener
    }
  }
}
