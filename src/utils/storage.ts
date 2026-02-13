export const safeSetItem = (key: string, value: string) => {
  const existing = localStorage.getItem(key)
  if (existing !== null) {
    localStorage.setItem(`${key}Backup`, existing)
  }
  localStorage.setItem(key, value)
}

export const restoreBackup = (key: string) => {
  const backup = localStorage.getItem(`${key}Backup`)
  if (!backup) return false
  localStorage.setItem(key, backup)
  return true
}
