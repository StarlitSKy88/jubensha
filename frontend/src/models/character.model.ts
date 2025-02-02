import { Schema, model } from 'mongoose'
import { nanoid } from 'nanoid'
import type { ICharacter, ICharacterRelationship } from '@/types/character'

const characterRelationshipSchema = new Schema&lt;ICharacterRelationship&gt;({
  characterId: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String }
})

const characterSchema = new Schema&lt;ICharacter&gt;({
  id: { type: String, default: () => nanoid(), unique: true },
  projectId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['protagonist', 'antagonist', 'supporting'] },
  archetype: { type: String, required: true },
  avatar: { type: String },
  
  personality: {
    traits: [{ type: String }],
    mbti: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }]
  },

  background: {
    age: { type: Number },
    occupation: { type: String },
    education: { type: String },
    family: { type: String },
    history: { type: String }
  },

  motivation: {
    goals: [{ type: String }],
    fears: [{ type: String }],
    desires: [{ type: String }]
  },

  arc: {
    startingPoint: { type: String },
    keyEvents: [{ type: String }],
    endingPoint: { type: String }
  },

  relationships: [characterRelationshipSchema],

  analysis: {
    depth: {
      score: { type: Number },
      details: { type: String }
    },
    consistency: {
      score: { type: Number },
      details: { type: String }
    },
    development: {
      score: { type: Number },
      details: { type: String }
    },
    suggestions: [{ type: String }]
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.createdAt = ret.createdAt?.toISOString()
      ret.updatedAt = ret.updatedAt?.toISOString()
      return ret
    }
  }
})

// 索引
characterSchema.index({ projectId: 1 })
characterSchema.index({ name: 1 })
characterSchema.index({ role: 1 })

export const Character = model&lt;ICharacter&gt;('Character', characterSchema)
export type { ICharacter, ICharacterRelationship } 