'use client';

import { Button } from 'antd';

import { useRouter } from 'next/navigation';

import { CenterLayout } from '@/src/3widgets/layouts';
import { ObjectNameTable } from '@/src/4features/tables';

import '@ant-design/v5-patch-for-react-19';

interface ObjectNameProps {
  bim: string;
}

export function ObjectName({ bim }: ObjectNameProps) {
  const router = useRouter();

  return (
    <CenterLayout>
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">객체 리스트</h1>
        <p className="text-lg text-gray-500">
          BIM: <strong>{decodeURIComponent(bim)}</strong>
        </p>

        <ObjectNameTable bim={decodeURIComponent(bim)} />

        <Button onClick={() => router.push('/')} className="mt-4">
          홈으로
        </Button>
      </div>
    </CenterLayout>
  );
}
