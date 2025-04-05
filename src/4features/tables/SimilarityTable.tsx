import { Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { useEffect, useState } from 'react';

interface SimilarityData {
  id: string;
  propertySet: string;
  propertyName: string;
  propertyValue: string;
  target: string;
  similarity: number;
}

interface SimilarityTableProps {
  refresh?: number;
  collectionName: string;
}

export function SimilarityTable({ refresh = 0, collectionName }: SimilarityTableProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<SimilarityData[]>([]);

  const fetchSimilarityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/similarity/read?collectionName=${collectionName}`);

      if (response.ok) {
        const data = await response.json();
        setData(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimilarityData();
  }, [collectionName, refresh]); // refresh가 변경될 때마다 데이터를 다시 불러옴

  const columns: ColumnsType<SimilarityData> = [
    {
      title: '속성세트',
      dataIndex: 'propertySet',
      key: 'propertySet',
    },
    {
      title: '속성명',
      dataIndex: 'propertyName',
      key: 'propertyName',
    },
    {
      title: '속성값',
      dataIndex: 'propertyValue',
      key: 'propertyValue',
    },
    {
      title: '대상',
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: '유사도',
      dataIndex: 'similarity',
      key: 'similarity',
      width: 100,
      align: 'center',
      sorter: (a, b) => b.similarity - a.similarity,
      render: (similarity) => {
        const percent = (similarity * 100).toFixed(2);
        let color = 'green';

        if (similarity < 0.3) color = 'red';
        else if (similarity < 0.7) color = 'orange';

        return <Tag color={color}>{percent}%</Tag>;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data.map((item) => ({ ...item, key: item.id }))}
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
        position: ['bottomCenter'],
      }}
      scroll={{ x: 1000 }}
    />
  );
}
