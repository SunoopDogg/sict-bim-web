'use client';

import { Button, Upload, message } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';

import { CenterLayout } from '@/src/3widgets/layouts';

import '@ant-design/v5-patch-for-react-19';

export function Main() {
  const [messageApi, contextHolder] = message.useMessage();

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
    if (info.file.status === 'done') {
      const formData = new FormData();
      formData.append('file', info.file.originFileObj as RcFile);
      const response = await fetch('/api/bim/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        messageApi.success('파일이 성공적으로 업로드되었습니다.');
      } else {
        messageApi.error('파일 업로드에 실패했습니다.');
      }
    } else if (info.file.status === 'error') {
      messageApi.error(`${info.file.name} 파일 업로드에 실패했습니다.`);
    }
  };

  const handleClick = async () => {
    const searchParams = new URLSearchParams({
      dbName: 'bim',
      collectionName: '속성테이블(프로세스)',
    });

    const response = await fetch(`/api/bim/read?${searchParams.toString()}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Fetched data:', data);
    }
  };

  const handleAnalyze = async () => {
    const response = await fetch('/api/similarity/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dbName: 'bim',
        collectionName: '속성테이블(프로세스)',
        delimiter: ['_'],
        method: 'jaccard',
      }),
    });
  };

  return (
    <CenterLayout>
      {contextHolder}

      <div className="flex flex-col items-center justify-center gap-4">
        <Upload
          accept=".xlsx"
          beforeUpload={beforeUpload}
          onChange={handleChange}
          maxCount={1}
          showUploadList={false}
        >
          <Button>엑셀 파일(.xlsx) 업로드</Button>
        </Upload>

        <Button type="primary" onClick={handleClick}>
          데이터 불러오기
        </Button>

        <Button type="primary" onClick={handleAnalyze}>
          분석하기
        </Button>
      </div>
    </CenterLayout>
  );
}
