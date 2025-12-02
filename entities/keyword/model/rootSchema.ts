import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRootKeyword extends Document {
  company: string;
  keyword: string;
  visibility: boolean;
  url: string;
  lastChecked: Date;
  isUpdateRequired?: boolean;
  keywordType?: string;
  matchedTitle?: string;
  popularTopic?: string;
  postVendorName?: string;
  rank?: number;
  rankWithCafe?: number;
  restaurantName?: string;
  createdAt: Date;
  updatedAt: Date;
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
      isUpdateRequired: {
        type: Boolean,
      },
      keywordType: {
        type: String,
      },
      matchedTitle: {
        type: String,
      },
      popularTopic: {
        type: String,
      },
      postVendorName: {
        type: String,
      },
      rank: {
        type: Number,
      },
      rankWithCafe: {
        type: Number,
      },
      restaurantName: {
        type: String,
      },
    },
    {
      timestamps: true,
    }
  );

  RootKeywordSchema.index({ company: 1, keyword: 1 });
  // Stable chronological scan for large sorts
  RootKeywordSchema.index({ createdAt: 1, _id: 1 });

  RootKeyword =
    mongoose.models.RootKeyword ||
    mongoose.model<IRootKeyword>('RootKeyword', RootKeywordSchema);
} else {
  RootKeyword = {} as Model<IRootKeyword>;
}

export { RootKeyword };
