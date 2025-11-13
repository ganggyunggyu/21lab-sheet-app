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
}

let Keyword: Model<IKeyword>;

if (typeof window === 'undefined') {
  // In dev/hot-reload environments, ensure schema updates take effect
  try {
    if (mongoose.connection?.models?.Keyword) {
      delete (mongoose.connection.models as any).Keyword;
    }
  } catch {}

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

  // Helpful index for common queries/updates
  KeywordSchema.index({ company: 1, keyword: 1, sheetType: 1 });
  // Stable chronological scan for large sorts
  KeywordSchema.index({ createdAt: 1, _id: 1 });

  Keyword =
    mongoose.models.Keyword ||
    mongoose.model<IKeyword>('Keyword', KeywordSchema);
} else {
  Keyword = {} as Model<IKeyword>;
}

export { Keyword };
