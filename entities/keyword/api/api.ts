import { connectDB } from '@/shared';
import { Keyword, IKeyword } from '../model';

export interface KeywordData {
  company: string;
  keyword: string;
  visibility: boolean;
  popularTopic: string;
  url: string;
  sheetType: 'package' | 'dogmaru-exclude';
}

export const replaceAllKeywords = async (keywords: KeywordData[]) => {
  await connectDB();

  if (keywords.length === 0) {
    return {
      deleted: 0,
      inserted: 0,
    };
  }

  const sheetType = keywords[0].sheetType;

  console.log('🔥 삭제 대상 sheetType:', sheetType);
  console.log('🔥 삭제 전 전체 개수:', await Keyword.countDocuments());
  console.log('🔥 삭제 대상 개수:', await Keyword.countDocuments({ sheetType }));

  const deleteResult = await Keyword.deleteMany({ sheetType });

  console.log('🔥 삭제된 개수:', deleteResult.deletedCount);
  console.log('🔥 삭제 후 전체 개수:', await Keyword.countDocuments());

  const dataToInsert = keywords.map((kw) => ({
    ...kw,
    lastChecked: new Date(),
  }));

  console.log('🔥 삽입할 데이터 샘플:', dataToInsert.slice(0, 2));
  console.log('🔥 스키마 필드:', Object.keys(Keyword.schema.obj));

  const insertResult = await Keyword.insertMany(dataToInsert);

  console.log('🔥 삽입된 개수:', insertResult.length);
  console.log('🔥 삽입된 데이터 샘플:', insertResult.slice(0, 2).map(doc => doc.toObject()));

  return {
    deleted: deleteResult.deletedCount,
    inserted: insertResult.length,
  };
};

export const upsertKeywords = async (keywords: KeywordData[]) => {
  await connectDB();

  const operations = keywords.map((kw) => ({
    updateOne: {
      filter: { company: kw.company, keyword: kw.keyword },
      update: {
        $set: {
          visibility: kw.visibility,
          lastChecked: new Date(),
        },
      },
      upsert: true,
    },
  }));

  const result = await Keyword.bulkWrite(operations);
  return result;
};

export const getAllKeywords = async (): Promise<IKeyword[]> => {
  await connectDB();
  return await Keyword.find().sort({ company: 1, keyword: 1 }).lean();
};

export const getKeywordsByCompany = async (company: string): Promise<IKeyword[]> => {
  await connectDB();
  return await Keyword.find({ company }).sort({ keyword: 1 }).lean();
};

export const updateKeywordVisibility = async (
  company: string,
  keyword: string,
  visibility: boolean
) => {
  await connectDB();
  return await Keyword.findOneAndUpdate(
    { company, keyword },
    { $set: { visibility, lastChecked: new Date() } },
    { new: true, upsert: true }
  ).lean();
};

export const getVisibilityStats = async () => {
  await connectDB();

  const total = await Keyword.countDocuments();
  const visible = await Keyword.countDocuments({ visibility: true });
  const hidden = await Keyword.countDocuments({ visibility: false });

  return {
    total,
    visible,
    hidden,
  };
};
