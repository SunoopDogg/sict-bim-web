'use client';

import { Button, Input, Space, Tag, message } from 'antd';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import { CenterLayout } from '@/src/3widgets/layouts';
import { SimilarityTable } from '@/src/4features/tables';

import '@ant-design/v5-patch-for-react-19';

interface BimProps {
  id: string;
}

export function Bim({ id }: BimProps) {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const [delimiter, setDelimiter] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // 분석 완료 후 테이블을 리렌더링하기 위한 상태 추가
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/similarity/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dbName: 'bim',
          collectionName: decodeURIComponent(id),
          delimiter: delimiter,
          method: 'jaccard',
        }),
      });

      if (response.ok) {
        messageApi.success('분석이 완료되었습니다.');
        // 분석 완료 후 refreshKey 증가하여 테이블 리렌더링
        setRefreshKey((prev) => prev + 1);
      } else {
        const errorData = await response.json();
        messageApi.error(`분석 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      messageApi.error('분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelimiter = () => {
    if (inputValue && !delimiter.includes(inputValue)) {
      setDelimiter([...delimiter, inputValue]);
      setInputValue('');
    }
  };

  const handleRemoveDelimiter = (value: string) => {
    setDelimiter(delimiter.filter((item) => item !== value));
  };

  return (
    <CenterLayout>
      {contextHolder}

      <div className="flex flex-col items-center justify-center gap-4">
        <Space>
          <Input
            placeholder="구분자를 입력하세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleAddDelimiter}
          />

          <Button type="primary" onClick={handleAddDelimiter}>
            추가
          </Button>
        </Space>

        <Space>
          {delimiter.map((item) => (
            <Tag key={item} closable onClose={() => handleRemoveDelimiter(item)}>
              {item}
            </Tag>
          ))}

          <Button type="primary" onClick={handleAnalyze} loading={loading}>
            {loading ? '분석 중...' : '분석하기'}
          </Button>
        </Space>

        <SimilarityTable refresh={refreshKey} collectionName={decodeURIComponent(id)} />

        <Button
          onClick={() => {
            router.push('/');
          }}
          className="mt-4"
        >
          돌아가기
        </Button>
      </div>
    </CenterLayout>
  );
}
