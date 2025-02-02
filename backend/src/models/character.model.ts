import { Schema, model, Document } from 'mongoose'
import { nanoid } from 'nanoid'

export interface ICharacter extends Document {
  id: string
  projectId: string
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting'
  archetype: string
  personality: {
    traits: string[]
    mbti?: string
    strengths: string[]
    weaknesses: string[]
  }
  background: {
    age: number
    occupation: string
    education?: string
    family?: string
    history: string
  }
  appearance: {
    physical: string[]
    style: string[]
    distinctive: string[]
  }
  motivation: {
    goals: string[]
    fears: string[]
    desires: string[]
  }
  relationships: Array<{
    characterId: string
    type: string
    description: string
  }>
  arc: {
    startingPoint: string
    keyEvents: string[]
    endingPoint: string
  }
  analysis?: {
    depth: {
      score: number
      suggestions: string[]
    }
    consistency: {
      score: number
      issues: string[]
    }
    development: {
      score: number
      analysis: string
      suggestions: string[]
    }
  }
  createdAt: Date
  updatedAt: Date
}

const CharacterSchema = new Schema({
  id: {
    type: String,
    default: () => nanoid(),
    unique: true,
    required: true
  },
  projectId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['protagonist', 'antagonist', 'supporting'],
    required: true
  },
  archetype: {
    type: String,
    required: true
  },
  personality: {
    traits: [String],
    mbti: String,
    strengths: [String],
    weaknesses: [String]
  },
  background: {
    age: Number,
    occupation: String,
    education: String,
    family: String,
    history: String
  },
  appearance: {
    physical: [String],
    style: [String],
    distinctive: [String]
  },
  motivation: {
    goals: [String],
    fears: [String],
    desires: [String]
  },
  relationships: [{
    characterId: String,
    type: String,
    description: String
  }],
  arc: {
    startingPoint: String,
    keyEvents: [String],
    endingPoint: String
  },
  analysis: {
    depth: {
      score: Number,
      suggestions: [String]
    },
    consistency: {
      score: Number,
      issues: [String]
    },
    development: {
      score: Number,
      analysis: String,
      suggestions: [String]
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// 索引
CharacterSchema.index({ projectId: 1, name: 1 })
CharacterSchema.index({ projectId: 1, role: 1 })
CharacterSchema.index({ 'relationships.characterId': 1 })

export const Character = model<ICharacter>('Character', CharacterSchema) 