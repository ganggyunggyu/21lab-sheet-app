import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const getGlobal = () => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof global !== 'undefined') return global;
  return {} as typeof globalThis;
};

const g = getGlobal();

const cached: MongooseCache = g.mongooseCache || {
  conn: null,
  promise: null,
};

if (!g.mongooseCache) {
  g.mongooseCache = cached;
}

export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI 환경 변수를 설정해주세요');
  }

  if (cached.conn) {
    console.log('[DB] 캐시된 연결 재사용');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('[DB] 새로운 연결 생성 중...');
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  } else {
    console.log('[DB] 대기 중인 연결 Promise 발견, await 시작...');
  }

  try {
    console.log('[DB] MongoDB 연결 Promise await 중...');
    cached.conn = await cached.promise;
    console.log('[DB] MongoDB 연결 완료!');
  } catch (e) {
    cached.promise = null;
    console.error('[DB] MongoDB 연결 실패:', e);
    throw e;
  }

  return cached.conn;
};
