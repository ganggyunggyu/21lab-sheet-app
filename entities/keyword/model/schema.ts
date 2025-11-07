import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKeyword extends Document {
  company: string;
  keyword: string;
  visibility: boolean;
  popularTopic: string;
  url: string;
  sheetType: 'package' | 'dogmaru-exclude';
  lastChecked: Date;
}

let Keyword: Model<IKeyword>;

if (typeof window === 'undefined') {
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
        enum: ['package', 'dogmaru-exclude'],
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
