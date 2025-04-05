import { ObjectName } from '@/src/2pages/on';

export default async function OnPage({ params }: { params: Promise<{ bim: string }> }) {
  const { bim } = await params;

  return <ObjectName bim={bim} />;
}
