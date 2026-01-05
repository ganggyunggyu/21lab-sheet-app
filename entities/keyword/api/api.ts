import { connectDB } from '@/shared';
import { Keyword, IKeyword, type PackageKeywordData } from '../model';

export type KeywordData = Pick<
  PackageKeywordData,
  'company' | 'keyword' | 'sheetType'
> &
  Partial<Omit<PackageKeywordData, 'company' | 'keyword' | 'sheetType'>>;

export const replaceAllKeywords = async (
  keywords: KeywordData[],
  sheetType: string
) => {
  await connectDB();

  const deleteResult = await Keyword.deleteMany({ sheetType: sheetType });

  const updateResult = await Keyword.insertMany(keywords);

  return {
    deleted: deleteResult.deletedCount,
    inserted: updateResult.length,
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

  const keywords = await Keyword.find();

  return keywords;
};

export const getKeywordBySheetType = async (sheetType: string) => {
  await connectDB();
  const keywords = await Keyword.find({ sheetType: sheetType })
    .select('company keyword visibility popularTopic url rank rankWithCafe isUpdateRequired isNewLogic sheetType lastChecked createdAt updatedAt')
    .sort({ updatedAt: 1 })
    .lean();
  return keywords;
};

export const getKeywordsByKeywordType = async (keywordType: string) => {
  await connectDB();
  const keywords = await Keyword.find({ keywordType })
    .select('company keyword visibility popularTopic url rank rankWithCafe isUpdateRequired isNewLogic sheetType keywordType lastChecked createdAt updatedAt')
    .sort({ updatedAt: 1 })
    .lean();
  return keywords;
};

export const getKeywordsByCompanies = async (companies: string[]) => {
  await connectDB();
  const keywords = await Keyword.find({ company: { $in: companies } })
    .select('company keyword visibility popularTopic url rank rankWithCafe isUpdateRequired isNewLogic sheetType keywordType lastChecked createdAt updatedAt')
    .sort({ updatedAt: 1 })
    .lean();
  return keywords;
};

export const getKeywordsByCompany = async (
  company: string
): Promise<IKeyword[]> => {
  await connectDB();
  return await Keyword.find({ company }).sort({ keyword: 1 });
};

export const updateKeywordVisibility = async (
  company: string,
  keyword: string,
  visibility: boolean,
  sheetType?: 'package' | 'dogmaru-exclude' | 'dogmaru'
): Promise<IKeyword | null> => {
  await connectDB();
  const filter: Record<string, unknown> = { company, keyword };
  if (sheetType) filter.sheetType = sheetType;

  return await Keyword.findOneAndUpdate(
    filter,
    { $set: { visibility, lastChecked: new Date() } },
    { new: true, upsert: true }
  );
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
