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
 * MongoDB 데이터베이스에서 모든 컬렉션의 이름을 조회합니다.
 *
 * @param dbName 데이터베이스 이름
 * @returns 컬렉션 이름 배열
 */
export async function getAllCollections(dbName: string): Promise<string[]> {
  try {
    const client = connectDB;
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    return collections.map((collection) => collection.name);
  } catch (error) {
    throw error;
  }
}

/**
 * MongoDB 데이터베이스에서 모든 컬렉션의 이름을 조회하고 페이지네이션을 적용합니다.
 *
 * @param dbName 데이터베이스 이름
 * @param page 현재 페이지 (1부터 시작)
 * @param pageSize 페이지당 항목 수
 * @param search 검색어 (선택적)
 * @returns {items: string[], total: number} 페이지네이션된 컬렉션 이름 배열과 전체 개수
 */
export async function getPaginatedCollections(
  dbName: string,
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
): Promise<{ items: string[]; total: number }> {
  try {
    const client = connectDB;
    const db = client.db(dbName);

    // 먼저 모든 컬렉션을 가져옵니다
    const allCollections = await db.listCollections().toArray();

    // JavaScript 레벨에서 검색어를 기반으로 필터링합니다
    const filteredCollections = search
      ? allCollections.filter((collection) =>
          collection.name.toLowerCase().includes(search.toLowerCase()),
        )
      : allCollections;

    const total = filteredCollections.length;
    const skip = (page - 1) * pageSize;
    const items = filteredCollections
      .slice(skip, skip + pageSize)
      .map((collection) => collection.name);
    return {
      items,
      total,
    };
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

/**
 * MongoDB 컬렉션의 특정 문서를 삭제합니다.
 *
 * @param dbName 데이터베이스 이름
 * @param collectionName 컬렉션 이름
 * @param query 삭제할 문서의 쿼리 객체
 * @returns 삭제된 문서의 수
 */
export async function deleteDocumentInCollection(
  dbName: string,
  collectionName: string,
  query: Record<string, any>,
): Promise<number> {
  try {
    const client = connectDB;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.deleteMany(query);
    return result.deletedCount;
  } catch (error) {
    throw error;
  }
}

/**
 * MongoDB 컬렉션에서 쿼리 조건에 맞는 문서를 조회합니다.
 *
 * @param dbName 데이터베이스 이름
 * @param collectionName 컬렉션 이름
 * @param query 조회 쿼리 객체
 * @returns 조회된 문서 배열
 */
export async function findDocumentsInCollection(
  dbName: string,
  collectionName: string,
  query: Record<string, any>,
): Promise<any[]> {
  try {
    const client = connectDB;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const documents = await collection.find(query).toArray();
    return documents;
  } catch (error) {
    throw error;
  }
}


/**
 * MongoDB 컬렉션에서 검색어를 포함한 페이지네이션된 문서를 조회합니다.
 *
 * @param dbName 데이터베이스 이름
 * @param collectionName 컬렉션 이름
 * @param page 현재 페이지 (1부터 시작)
 * @param pageSize 페이지당 항목 수
 * @param search 검색어 (선택적)
 * @param searchField 검색할 필드 (선택적, 기본값은 'Name')
 * @returns {items: any[], total: number} 페이지네이션된 문서 배열과 전체 개수
 */
export async function getSearchedPaginatedDocuments(
  dbName: string,
  collectionName: string,
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  searchField: string = 'Name',
): Promise<{ items: any[]; total: number }> {
  try {
    const client = connectDB;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 검색 쿼리 구성
    const query = search
      ? { [searchField]: { $regex: search, $options: 'i' } } // 대소문자 구분없이 검색
      : {};

    const total = await collection.countDocuments(query);
    const skip = (page - 1) * pageSize;

    const items = await collection.find(query).skip(skip).limit(pageSize).toArray();

    return {
      items,
      total,
    };
  } catch (error) {
    throw error;
  }
}
