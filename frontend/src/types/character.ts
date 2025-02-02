export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting'

export interface ICharacterPersonality {
  traits: string[]
  mbti?: string
  strengths: string[]
  weaknesses: string[]
}

export interface ICharacterBackground {
  age?: number
  occupation?: string
  education?: string
  family?: string
  history?: string
}

export interface ICharacterMotivation {
  goals: string[]
  fears: string[]
  desires: string[]
}

export interface ICharacterArc {
  startingPoint?: string
  keyEvents: string[]
  endingPoint?: string
}

export interface ICharacterAnalysis {
  depth: {
    score: number
    details: string
  }
  consistency: {
    score: number
    details: string
  }
  development: {
    score: number
    details: string
  }
  suggestions?: string[]
}

export interface ICharacterRelationship {
  characterId: string
  type: string
  description: string
}

export interface ICharacter {
  id: string
  projectId: string
  name: string
  role: CharacterRole
  archetype: string
  avatar?: string
  personality: ICharacterPersonality
  background: ICharacterBackground
  motivation: ICharacterMotivation
  arc: ICharacterArc
  relationships: ICharacterRelationship[]
  analysis?: ICharacterAnalysis
  createdAt: Date
  updatedAt: Date
}

export interface ICharacterSuggestion {
  role: CharacterRole
  traits: string[]
  context: string
} 