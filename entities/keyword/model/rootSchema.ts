import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRootKeyword extends Document {
  company: string;
  keyword: string;
  visibility: boolean;
  url: string;
  lastChecked: Date;
}

let RootKeyword: Model<IRootKeyword>;

if (typeof window === 'undefined') {
  const RootKeywordSchema = new Schema<IRootKeyword>(
    {
      company: {
        type: String,
        required: true,
      },
      keyword: {
        type: String,
        required: true,
      },
      visibility: {
        type: Boolean,
        default: false,
      },
      url: {
        type: String,
        default: '',
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

  RootKeywordSchema.index({ company: 1, keyword: 1 });

  RootKeyword =
    mongoose.models.RootKeyword ||
    mongoose.model<IRootKeyword>('RootKeyword', RootKeywordSchema);
} else {
  RootKeyword = {} as Model<IRootKeyword>;
}

export { RootKeyword };
