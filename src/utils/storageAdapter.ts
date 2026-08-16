export type StorageAdapter = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const fallbackStorage = new Map<string, string>()

export function getStorageAdapter(): StorageAdapter {
  if (typeof localStorage !== 'undefined' && localStorage !== null) {
    const storage = localStorage as {
      getItem?: (key: string) => string | null
      setItem?: (key: string, value: string) => void
      removeItem?: (key: string) => void
    }

    if (
      typeof storage.getItem === 'function' &&
      typeof storage.setItem === 'function' &&
      typeof storage.removeItem === 'function'
    ) {
      return {
        getItem: (key: string) => storage.getItem!(key),
        setItem: (key: string, value: string) => storage.setItem!(key, value),
        removeItem: (key: string) => storage.removeItem!(key),
      }
    }
  }

  return {
    getItem: (key: string) => fallbackStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      fallbackStorage.set(key, value)
    },
    removeItem: (key: string) => {
      fallbackStorage.delete(key)
    },
  }
}

export function resetStorageAdapterForTests(): void {
  fallbackStorage.clear()
}
