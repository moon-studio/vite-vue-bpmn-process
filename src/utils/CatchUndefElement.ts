import modeler from '@/store/modeler'

export default function (fn: (element: any) => unknown) {
  try {
    const modelerStore = modeler()

    const element = modelerStore.getActive
    if (!element) {
      return
    }
    fn(element)
  } catch (e) {
    console.error(e)
  }
}
