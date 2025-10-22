import { create } from 'zustand'
import { StoryBible, Character, Chapter } from './types'
import { saveStoryData, loadStoryData, requestPersistentStorage, checkStorageQuota } from './db'

interface ModelConfig {
  small: string
  medium: string
  large: string
}

interface StoryState extends StoryBible {
  models: ModelConfig
  activeChapterId: string | null
  isLoaded: boolean
  loadData: () => Promise<void>
  updateField: (field: keyof Omit<StoryBible, 'characters' | 'chapters'>, value: string) => void
  updateModel: (size: keyof ModelConfig, model: string) => void
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, character: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  addChapter: (chapter: Chapter) => void
  updateChapter: (id: string, chapter: Partial<Chapter>) => void
  deleteChapter: (id: string) => void
  setActiveChapter: (id: string | null) => void
  updateChapterContent: (id: string, content: string) => void
}

const persistToIndexedDB = async (state: Partial<StoryState>) => {
  const { isLoaded, loadData, updateField, updateModel, addCharacter, updateCharacter, deleteCharacter, 
          addChapter, updateChapter, deleteChapter, setActiveChapter, updateChapterContent, activeChapterId, ...dataToSave } = state as any
  
  try {
    await saveStoryData(dataToSave)
  } catch (error) {
    console.error('Failed to persist to IndexedDB:', error)
  }
}

export const useStoryStore = create<StoryState>((set, get) => ({
  braindump: '',
  synopsis: '',
  outline: '',
  worldbuilding: '',
  genre: '',
  styleGuide: '',
  characters: [],
  chapters: [],
  activeChapterId: null,
  isLoaded: false,
  models: {
    small: 'llama3.2:3b',
    medium: 'llama3.2:latest',
    large: 'llama3:70b'
  },
  
  loadData: async () => {
    try {
      await requestPersistentStorage()
      await checkStorageQuota()
      
      const savedData = await loadStoryData()
      
      if (savedData) {
        set({
          braindump: savedData.braindump || '',
          synopsis: savedData.synopsis || '',
          outline: savedData.outline || '',
          worldbuilding: savedData.worldbuilding || '',
          genre: savedData.genre || '',
          styleGuide: savedData.styleGuide || '',
          characters: savedData.characters || [],
          chapters: savedData.chapters || [],
          models: savedData.models || get().models,
          isLoaded: true
        })
        console.log('✅ Story data loaded from IndexedDB')
      } else {
        set({ isLoaded: true })
        console.log('📝 No saved data found, starting fresh')
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      set({ isLoaded: true })
    }
  },
  
  updateField: (field, value) => set((state) => {
    const newState = { ...state, [field]: value }
    persistToIndexedDB(newState)
    return { [field]: value }
  }),
  
  updateModel: (size, model) => set((state) => {
    const newState = { ...state, models: { ...state.models, [size]: model } }
    persistToIndexedDB(newState)
    return { models: { ...state.models, [size]: model } }
  }),
  
  addCharacter: (character) => set((state) => {
    const newState = { ...state, characters: [...state.characters, character] }
    persistToIndexedDB(newState)
    return { characters: [...state.characters, character] }
  }),
  
  updateCharacter: (id, updates) => set((state) => {
    const newState = { 
      ...state, 
      characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c)
    }
    persistToIndexedDB(newState)
    return { characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c) }
  }),
  
  deleteCharacter: (id) => set((state) => {
    const newState = { ...state, characters: state.characters.filter(c => c.id !== id) }
    persistToIndexedDB(newState)
    return { characters: state.characters.filter(c => c.id !== id) }
  }),
  
  addChapter: (chapter) => set((state) => {
    const newState = { ...state, chapters: [...state.chapters, chapter] }
    persistToIndexedDB(newState)
    return { chapters: [...state.chapters, chapter] }
  }),
  
  updateChapter: (id, updates) => set((state) => {
    const newState = {
      ...state,
      chapters: state.chapters.map(c => c.id === id ? { ...c, ...updates } : c)
    }
    persistToIndexedDB(newState)
    return { chapters: state.chapters.map(c => c.id === id ? { ...c, ...updates } : c) }
  }),
  
  deleteChapter: (id) => set((state) => {
    const newState = {
      ...state,
      chapters: state.chapters.filter(c => c.id !== id),
      activeChapterId: state.activeChapterId === id ? null : state.activeChapterId
    }
    persistToIndexedDB(newState)
    return {
      chapters: state.chapters.filter(c => c.id !== id),
      activeChapterId: state.activeChapterId === id ? null : state.activeChapterId
    }
  }),
  
  setActiveChapter: (id) => set(() => ({
    activeChapterId: id
  })),
  
  updateChapterContent: (id, content) => set((state) => {
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length
    const newState = {
      ...state,
      chapters: state.chapters.map(c => c.id === id ? { ...c, content, wordCount } : c)
    }
    persistToIndexedDB(newState)
    return { chapters: state.chapters.map(c => c.id === id ? { ...c, content, wordCount } : c) }
  })
}))
