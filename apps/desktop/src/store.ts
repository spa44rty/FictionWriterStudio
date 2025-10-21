import { create } from 'zustand'
import { StoryBible, Character } from './types'

interface StoryState extends StoryBible {
  updateField: (field: keyof Omit<StoryBible, 'characters'>, value: string) => void
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, character: Partial<Character>) => void
  deleteCharacter: (id: string) => void
}

export const useStoryStore = create<StoryState>((set) => ({
  braindump: '',
  synopsis: '',
  outline: '',
  worldbuilding: '',
  genre: '',
  styleGuide: '',
  characters: [],
  
  updateField: (field, value) => set((state) => ({ [field]: value })),
  
  addCharacter: (character) => set((state) => ({
    characters: [...state.characters, character]
  })),
  
  updateCharacter: (id, updates) => set((state) => ({
    characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  
  deleteCharacter: (id) => set((state) => ({
    characters: state.characters.filter(c => c.id !== id)
  }))
}))
