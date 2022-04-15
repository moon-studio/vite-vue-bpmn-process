function setLocal(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getLocal(key: string) {
  return JSON.parse(localStorage.getItem(key) || '')
}

export default {
  setLocal,
  getLocal
}
