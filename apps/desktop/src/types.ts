export type CharacterType = 'protagonist' | 'antagonist' | 'secondary' | 'support' | 'minor'

export interface Character {
  id: string
  name: string
  description: string
  voiceTone: string
  characterType: CharacterType
  personality: string
  background: string
}

export interface Chapter {
  id: string
  number: number
  title: string
  summary: string
  wordCount: number
  status: 'planned' | 'draft' | 'revised' | 'final'
}

export interface StoryBible {
  braindump: string
  synopsis: string
  outline: string
  worldbuilding: string
  genre: string
  styleGuide: string
  characters: Character[]
  chapters: Chapter[]
}

export const LIMITS = {
  braindump: 5000,
  synopsis: 5000,
  outline: 3000,
  worldbuilding: 3000,
  genre: 50,
  styleGuide: 2500,
} as const
