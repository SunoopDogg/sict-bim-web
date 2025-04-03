import { NextRequest, NextResponse } from 'next/server';

import { parseExcelFile } from '@/src/5entities/excel';
import {
  insertJsonToCollection,
  isExistsCollection,
  updateJsonToCollection,
} from '@/src/6shared/db/mongo';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const dbName = 'bim';
    const originName = file.name;
    const collectionName = originName.split('.')[0];
    const finalResult = await parseExcelFile(file);

    const isExists = await isExistsCollection(dbName, collectionName);

    if (isExists) {
      await updateJsonToCollection(dbName, collectionName, finalResult);
    }
    if (!isExists) {
      await insertJsonToCollection(dbName, collectionName, finalResult);
    }

    return NextResponse.json({ message: 'File processed successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}
