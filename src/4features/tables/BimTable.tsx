import { Table } from 'antd';

import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

interface Collection {
  name: string;
}

interface BimTableProps {
  refresh?: number;
}

export function BimTable({ refresh = 0 }: BimTableProps) {
  const router = useRouter();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        setLoading(true);
        const response = await fetch('/api/bim/read/all');
        if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
        const data = await response.json();
        setCollections(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, [refresh]); // refresh 값이 바뀔 때마다 데이터를 다시 불러옵니다

  const columns = [
    {
      title: '컬렉션 이름',
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
        onClick: () => {
          router.push(`/${record.name}`);
        },
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
