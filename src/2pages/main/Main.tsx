'use client';

import { Button, Upload, message } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';

import { useState } from 'react';

import { CenterLayout } from '@/src/3widgets/layouts';
import { BimTable } from '@/src/4features/tables';

import '@ant-design/v5-patch-for-react-19';

export function Main() {
  const [messageApi, contextHolder] = message.useMessage();
  const [refreshTable, setRefreshTable] = useState(0);
  const [loading, setLoading] = useState(false);

  const beforeUpload = (file: RcFile) => {
    const isXlsx =
      // cspell:disable-next-line
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (!isXlsx) {
      messageApi.error('xlsx 파일만 업로드 가능합니다.');
    }
    return isXlsx || Upload.LIST_IGNORE;
  };

  const handleChange: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      const formData = new FormData();
      formData.append('file', info.file.originFileObj as RcFile);

      try {
        const response = await fetch('/api/bim/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          messageApi.success('파일이 성공적으로 업로드되었습니다.');
          // 테이블 데이터 새로고침 트리거
          setRefreshTable((prev) => prev + 1);
        } else {
          messageApi.error('파일 업로드에 실패했습니다.');
        }
      } catch (error) {
        messageApi.error('파일 업로드 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    } else if (info.file.status === 'error') {
      messageApi.error(`${info.file.name} 파일 업로드에 실패했습니다.`);
      setLoading(false);
    }
  };

  return (
    <CenterLayout>
      {contextHolder}

      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">BIM 데이터 리스트</h1>

        <Upload
          accept=".xlsx"
          beforeUpload={beforeUpload}
          onChange={handleChange}
          maxCount={1}
          showUploadList={false}
        >
          <Button loading={loading}>엑셀 파일(.xlsx) 업로드</Button>
        </Upload>

        <BimTable refresh={refreshTable} />
      </div>
    </CenterLayout>
  );
}
