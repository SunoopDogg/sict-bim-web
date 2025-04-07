import { Similarity } from '@/src/2pages/similarity';

export default async function SimilarityPage({
  params,
}: {
  params: Promise<{ bim: string; on: string }>;
}) {
  const { bim, on } = await params;

  return <Similarity bim={bim} on={on} />;
}
