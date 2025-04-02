import * as XLSX from 'xlsx';

import { PropertyItem } from '@/src/5entities/excel';

/**
 * Excel 데이터를 처리하여 PropertyItem 배열로 변환하는 함수
 *
 * @param excelData Excel 데이터 배열
 * @returns PropertyItem 배열
 */
export function processExcelData(excelData: any[]): PropertyItem[] {
  const result: PropertyItem[] = [];
  let item: PropertyItem = {};
  let step = 3;
  let objectType: string | null = null;
  let globalId: string | null = null;

  // Iterate through each row in the data
  for (let idx = 0; idx < excelData.length; idx++) {
    const rowDict = excelData[idx] as any;

    // step 3: Check if all three values are NaN/null/undefined
    if (
      step === 3 &&
      (rowDict['속성세트'] === undefined ||
        rowDict['속성세트'] === null ||
        rowDict['속성세트'] === '') &&
      (rowDict['속성명'] === undefined || rowDict['속성명'] === null || rowDict['속성명'] === '') &&
      (rowDict['속성값'] === undefined || rowDict['속성값'] === null || rowDict['속성값'] === '')
    ) {
      result.push(item);
      item = {};
      step = 1;

      // Set object type
      if (rowDict['객체명']?.startsWith('객체유형')) {
        objectType = rowDict['객체명'].split(':')[1].trim();
        continue;
      }
    }

    // step 1: Set object name
    if (step === 1) {
      step = 2;
      globalId = rowDict['객체명'].split(':')[1].trim();
    }
    // step 2: Set object info
    else if (step === 2) {
      step = 3;
      item.ObjectType = objectType || '';
      item.GlobalID = globalId || '';
      item.Name = rowDict['객체명'] || '';
    }

    // step 3: Set property set and property name
    if (step === 3) {
      if (
        rowDict['속성세트'] === undefined ||
        rowDict['속성세트'] === null ||
        rowDict['속성세트'] === ''
      ) {
        item[rowDict['속성명']] =
          rowDict['속성값'] !== undefined && rowDict['속성값'] !== null && rowDict['속성값'] !== ''
            ? rowDict['속성값']
            : '';
        continue;
      } else {
        if (!item[rowDict['속성세트']]) {
          item[rowDict['속성세트']] = {};
        }
      }

      item[rowDict['속성세트']][rowDict['속성명']] =
        rowDict['속성값'] !== undefined && rowDict['속성값'] !== null && rowDict['속성값'] !== ''
          ? rowDict['속성값']
          : '';
    }
  }

  result.push(item);
  return result.slice(1);
}

/**
 * Excel 파일을 파싱하여 JSON 데이터로 변환하는 함수
 *
 * @param file 업로드된 Excel 파일
 * @returns 처리된 데이터 객체 배열
 */
export async function parseExcelFile(file: File): Promise<PropertyItem[]> {
  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Read Excel file
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  return processExcelData(data);
}
