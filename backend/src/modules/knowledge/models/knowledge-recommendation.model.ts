import { Schema, Document, Types, model } from 'mongoose';

export interface IKnowledgeRecommendation extends Document {
  knowledgeId: Types.ObjectId;
  projectId: Types.ObjectId;
  recommendations: Array<{
    knowledgeId: Types.ObjectId;
    score: number;
    type: 'content' | 'tag' | 'vector';
    reason: string;
  }>;
  metadata: {
    contentSimilarity: number;
    tagOverlap: number;
    vectorDistance: number;
    lastCalculated: Date;
  };
}

const KnowledgeRecommendationSchema = new Schema<IKnowledgeRecommendation>(
  {
    knowledgeId: {
      type: Schema.Types.ObjectId,
      ref: 'Knowledge',
      required: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    recommendations: [
      {
        knowledgeId: {
          type: Schema.Types.ObjectId,
          ref: 'Knowledge',
          required: true
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 1
        },
        type: {
          type: String,
          enum: ['content', 'tag', 'vector'],
          required: true
        },
        reason: {
          type: String,
          required: true
        }
      }
    ],
    metadata: {
      contentSimilarity: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      },
      tagOverlap: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      },
      vectorDistance: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      },
      lastCalculated: {
        type: Date,
        required: true,
        default: Date.now
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// 索引
KnowledgeRecommendationSchema.index({ knowledgeId: 1 }, { unique: true });
KnowledgeRecommendationSchema.index({ projectId: 1 });
KnowledgeRecommendationSchema.index({ 'recommendations.score': -1 });
KnowledgeRecommendationSchema.index({ 'metadata.lastCalculated': 1 });

// 虚拟字段
KnowledgeRecommendationSchema.virtual('recommendationCount').get(function (this: IKnowledgeRecommendation) {
  return this.recommendations.length;
});

KnowledgeRecommendationSchema.virtual('averageScore').get(function (this: IKnowledgeRecommendation) {
  if (!this.recommendations.length) return 0;
  const totalScore = this.recommendations.reduce((sum, rec) => sum + rec.score, 0);
  return totalScore / this.recommendations.length;
});

export const KnowledgeRecommendation = model<IKnowledgeRecommendation>(
  'KnowledgeRecommendation',
  KnowledgeRecommendationSchema
); 