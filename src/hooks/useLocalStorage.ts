import { useState } from 'react'
import { safeSetItem } from '../utils/storage'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      safeSetItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

export function useLocalStorageBoolean(key: string, initialValue: boolean) {
  return useLocalStorage<boolean>(key, initialValue)
}

export function useLocalStorageString(key: string, initialValue: string) {
  return useLocalStorage<string>(key, initialValue)
}

export function useLocalStorageNumber(key: string, initialValue: number) {
  return useLocalStorage<number>(key, initialValue)
}
