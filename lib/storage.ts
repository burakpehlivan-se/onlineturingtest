let globalStore: Map<string, any> = new Map()

export function getStore() {
  return globalStore
}

export function setStore(key: string, value: any) {
  globalStore.set(key, value)
}

export function getStoreValue(key: string) {
  return globalStore.get(key)
}

export function deleteStoreValue(key: string) {
  globalStore.delete(key)
}
