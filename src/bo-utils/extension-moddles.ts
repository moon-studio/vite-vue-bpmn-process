/**
 * 创建脚本对象
 * @param options
 * @param prefix
 * @returns {Script}
 */
export function createScriptObject(options, prefix) {
  const { scriptType, scriptFormat, value, resource } = options || {}
  const scriptConfig =
    scriptType === 'inlineScript' ? { scriptFormat, value } : { scriptFormat, resource }
  return window.bpmnInstances.moddle.create(`${prefix}:Script`, scriptConfig)
}
