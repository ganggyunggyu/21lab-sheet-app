import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKeyword extends Document {
  company: string;
  keyword: string;
  visibility: boolean;
  popularTopic: string;
  url: string;
  sheetType: 'package' | 'dogmaru' | 'dogmaru-exclude';
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
  rank: number;
  rankWithCafe?: number;
  isUpdateRequired?: boolean;
  isNewLogic?: boolean;
}

let Keyword: Model<IKeyword>;

if (typeof window === 'undefined') {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev && mongoose.models.Keyword) {
    delete mongoose.models.Keyword;
  }

  const KeywordSchema = new Schema<IKeyword>(
    {
      company: {
        type: String,
      },
      keyword: {
        type: String,
      },
      visibility: {
        type: Boolean,
        default: false,
      },
      popularTopic: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
      rank: {
        type: Number,
        default: 0,
      },
      rankWithCafe: {
        type: Number,
        default: 0,
      },
      isUpdateRequired: {
        type: Boolean,
      },
      isNewLogic: {
        type: Boolean,
        default: false,
      },
      sheetType: {
        type: String,
        enum: ['package', 'dogmaru', 'dogmaru-exclude'],
        required: true,
      },
      lastChecked: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

  Keyword =
    mongoose.models.Keyword ||
    mongoose.model<IKeyword>('Keyword', KeywordSchema);
} else {
  Keyword = {} as Model<IKeyword>;
}

export { Keyword };
