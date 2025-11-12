import { connectDB } from '@/shared';
import { RootKeyword, IRootKeyword, type RootKeywordData } from '../model';

export const replaceAllRootKeywords = async (keywords: RootKeywordData[]) => {
  await connectDB();

  if (keywords.length === 0) {
    return {
      deleted: 0,
      inserted: 0,
    };
  }

  console.log('🔥 루트건바 전체 삭제 시작');
  console.log('🔥 삭제 전 전체 개수:', await RootKeyword.countDocuments());

  const deleteResult = await RootKeyword.deleteMany({});

  console.log('🔥 삭제된 개수:', deleteResult.deletedCount);

  const dataToInsert = keywords.map((kw) => ({
    ...kw,
    lastChecked: new Date(),
  }));

  console.log('🔥 삽입할 데이터 샘플:', dataToInsert.slice(0, 2));

  const insertResult = await RootKeyword.insertMany(dataToInsert);

  console.log('🔥 삽입된 개수:', insertResult.length);
  console.log('🔥 삽입된 데이터 샘플:', insertResult.slice(0, 2).map(doc => doc.toObject()));

  return {
    deleted: deleteResult.deletedCount,
    inserted: insertResult.length,
  };
};

export const getAllRootKeywords = async (): Promise<IRootKeyword[]> => {
  await connectDB();
  // 삽입 순서 보장: 기본 _id 인덱스로 정렬 (메모리 초과 회피)
  return await RootKeyword.find().sort({ _id: 1 });
};

export const getRootKeywordsByCompany = async (
  company: string
): Promise<IRootKeyword[]> => {
  await connectDB();
  return await RootKeyword.find({ company }).sort({ keyword: 1 });
};

export const updateRootKeywordVisibility = async (
  company: string,
  keyword: string,
  visibility: boolean
): Promise<IRootKeyword | null> => {
  await connectDB();

  return await RootKeyword.findOneAndUpdate(
    { company, keyword },
    { $set: { visibility, lastChecked: new Date() } },
    { new: true, upsert: true }
  );
};

export const getRootVisibilityStats = async () => {
  await connectDB();

  const total = await RootKeyword.countDocuments();
  const visible = await RootKeyword.countDocuments({ visibility: true });
  const hidden = await RootKeyword.countDocuments({ visibility: false });

  return {
    total,
    visible,
    hidden,
  };
};
