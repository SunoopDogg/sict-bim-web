import { connectDB } from '../mongoConfig';

/**
 * MongoDB 데이터베이스에 컬렉션이 존재하는지 확인합니다.
 *
 * @param dbName 데이터베이스 이름
 * @param collectionName 컬렉션 이름
 * @returns 컬렉션 존재 여부
 */
export async function isExistsCollection(dbName: string, collectionName: string): Promise<boolean> {
  try {
    const client = connectDB;
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();

    return collections.some((collection) => collection.name === collectionName);
  } catch (error) {
    throw error;
  }
}

/**
 * MongoDB 컬렉션에서 모든 문서를 조회합니다.
 *
 * @param dbName 데이터베이스 이름
 * @param collectionName 컬렉션 이름
 * @returns 조회된 모든 문서 배열
 */
export async function getAllDocumentsFromCollection(
  dbName: string,
  collectionName: string,
): Promise<any[]> {
  try {
    const client = connectDB;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const documents = await collection.find({}).toArray();
    return documents;
  } catch (error) {
    throw error;
  }
}

/**
 * MongoDB 컬렉션에 JSON 데이터를 삽입합니다.
 *
 * @param dbName 데이터베이스 이름
 * @param collectionName 컬렉션 이름
 * @param jsonData 삽입할 JSON 데이터 배열
 */
export async function insertJsonToCollection(
  dbName: string,
  collectionName: string,
  jsonData: any[],
): Promise<void> {
  try {
    const client = connectDB;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.insertMany(jsonData);
  } catch (error) {
    throw error;
  }
}

/**
 * MongoDB 컬렉션의 데이터를 JSON으로 업데이트합니다.
 *
 * @param dbName 데이터베이스 이름
 * @param collectionName 컬렉션 이름
 * @param jsonData 업데이트할 JSON 데이터 배열
 */
export async function updateJsonToCollection(
  dbName: string,
  collectionName: string,
  jsonData: any[],
): Promise<void> {
  try {
    const client = connectDB;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.deleteMany({}); // Clear existing data
    await collection.insertMany(jsonData);
  } catch (error) {
    throw error;
  }
}
