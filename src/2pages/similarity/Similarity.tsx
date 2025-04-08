'use client';

import { Button } from 'antd';

import { useRouter } from 'next/navigation';

import { CenterLayout } from '@/src/3widgets/layouts';
import { SimilarityTable } from '@/src/4features/tables';

import '@ant-design/v5-patch-for-react-19';

interface SimilarityProps {
  bim: string;
  on: string;
}

export function Similarity({ bim, on }: SimilarityProps) {
  const router = useRouter();

  return (
    <CenterLayout>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">유사도 분석</h1>

        <div className="flex flex-col items-center justify-center">
          <p className="text-lg text-gray-500">
            BIM:{' '}
            <strong>
              {decodeURIComponent(bim)} - {decodeURIComponent(on)}
            </strong>
          </p>
        </div>

        <SimilarityTable bim={decodeURIComponent(bim)} on={on} />

        <Button onClick={() => router.push(`/${bim}`)} className="mt-4">
          돌아가기
        </Button>
      </div>
    </CenterLayout>
  );
}
