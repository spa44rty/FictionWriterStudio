import Dexie, { Table } from 'dexie'
import { StoryBible } from './types'

interface StoredData extends StoryBible {
  id?: number
  models: {
    small: string
    medium: string
    large: string
  }
}

export class StoryDatabase extends Dexie {
  storyData!: Table<StoredData>

  constructor() {
    super('OfflineFictionDB')
    
    this.version(1).stores({
      storyData: '++id'
    })
  }
}

export const db = new StoryDatabase()

export async function loadStoryData(): Promise<StoredData | null> {
  const data = await db.storyData.toArray()
  return data.length > 0 ? data[0] : null
}

export async function saveStoryData(data: Partial<StoredData>): Promise<void> {
  const existing = await db.storyData.toArray()
  
  if (existing.length > 0) {
    await db.storyData.update(existing[0].id!, data)
  } else {
    await db.storyData.add(data as StoredData)
  }
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    const granted = await navigator.storage.persist()
    console.log(`Persistent storage ${granted ? 'granted' : 'denied'}`)
    return granted
  }
  return false
}

export async function checkStorageQuota(): Promise<void> {
  if (navigator.storage && navigator.storage.estimate) {
    const { quota, usage } = await navigator.storage.estimate()
    console.log(`Storage used: ${((usage || 0) / 1024 / 1024).toFixed(2)} MB of ${((quota || 0) / 1024 / 1024).toFixed(2)} MB`)
  }
}
