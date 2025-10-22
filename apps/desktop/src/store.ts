import { create } from 'zustand'
import { StoryBible, Character, Chapter } from './types'

interface ModelConfig {
  small: string
  medium: string
  large: string
}

interface StoryState extends StoryBible {
  models: ModelConfig
  updateField: (field: keyof Omit<StoryBible, 'characters' | 'chapters'>, value: string) => void
  updateModel: (size: keyof ModelConfig, model: string) => void
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, character: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  addChapter: (chapter: Chapter) => void
  updateChapter: (id: string, chapter: Partial<Chapter>) => void
  deleteChapter: (id: string) => void
}

export const useStoryStore = create<StoryState>((set) => ({
  braindump: '',
  synopsis: '',
  outline: '',
  worldbuilding: '',
  genre: '',
  styleGuide: '',
  characters: [],
  chapters: [],
  models: {
    small: 'llama3.2:3b',
    medium: 'llama3.2:latest',
    large: 'llama3:70b'
  },
  
  updateField: (field, value) => set(() => ({ [field]: value })),
  
  updateModel: (size, model) => set((state) => ({
    models: { ...state.models, [size]: model }
  })),
  
  addCharacter: (character) => set((state) => ({
    characters: [...state.characters, character]
  })),
  
  updateCharacter: (id, updates) => set((state) => ({
    characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  
  deleteCharacter: (id) => set((state) => ({
    characters: state.characters.filter(c => c.id !== id)
  })),
  
  addChapter: (chapter) => set((state) => ({
    chapters: [...state.chapters, chapter]
  })),
  
  updateChapter: (id, updates) => set((state) => ({
    chapters: state.chapters.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  
  deleteChapter: (id) => set((state) => ({
    chapters: state.chapters.filter(c => c.id !== id)
  }))
}))
