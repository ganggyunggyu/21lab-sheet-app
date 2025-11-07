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
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
