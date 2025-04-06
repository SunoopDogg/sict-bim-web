import { Table } from 'antd';

import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

interface Collection {
  name: string;
}

interface ObjectNameTableProps {
  bim: string;
}

export function ObjectNameTable({ bim }: ObjectNameTableProps) {
  const router = useRouter();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCollections() {
    try {
      setLoading(true);

      const response = await fetch(`/api/bim/read?dbName=bim&collectionName=${bim}`);

      if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
      const data = await response.json();

      setCollections(
        data.map((item: any) => ({
          name: item.Name,
        })),
      );
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchCollections();
  }, []);

  const columns = [
    {
      title: '객체 이름',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  return (
    <Table
      dataSource={collections}
      columns={columns}
      loading={loading}
      rowKey="name"
      bordered
      onRow={(record) => ({
        onClick: () => router.push(`/${bim}/${record.name}`),
        style: {
          cursor: 'pointer',
        },
      })}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        position: ['bottomCenter'],
      }}
    />
  );
}
