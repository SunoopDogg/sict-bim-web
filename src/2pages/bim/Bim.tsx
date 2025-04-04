'use client';

import { Button, Table } from 'antd';

import { useRouter } from 'next/navigation';

import { CenterLayout } from '@/src/3widgets/layouts';

interface BimProps {
  id: string;
}
export function Bim({ id }: BimProps) {
  const router = useRouter();

  const handleAnalyze = async () => {
    const response = await fetch('/api/similarity/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dbName: 'bim',
        collectionName: id,
        delimiter: ['_'],
        method: 'jaccard',
      }),
    });
  };

  return (
    <CenterLayout>
      <div className="flex flex-col items-center justify-center gap-4">
        <Button type="primary" onClick={handleAnalyze} disabled>
          분석하기
        </Button>

        <Table />

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
