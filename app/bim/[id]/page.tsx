import { Bim } from '@/src/2pages/bim';

export default async function BimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <Bim id={id} />;
}
