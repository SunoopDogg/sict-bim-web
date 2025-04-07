import { Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { useEffect, useState } from 'react';

interface SimilarityData {
  id: string;
  propertySet: string;
  propertyName: string;
  propertyValue: string;
  target: string;
  method: string;
  similarity: number;
}

interface SimilarityTableProps {
  bim: string;
  on: string;
  refresh?: number;
}

export function SimilarityTable({ bim, on, refresh = 0 }: SimilarityTableProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<SimilarityData[]>([]);

  const fetchSimilarityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/similarity/read?bim=${bim}&on=${on}`);

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
  }, [bim, on, refresh]);

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
      title: '계산법',
      dataIndex: 'method',
      key: 'method',
      render: (text: string) => {
        const methodMap: Record<string, string> = {
          jaccard: '자카드 유사도',
          cosine: '코사인 유사도',
          levenshtein: '레벤슈타인 거리',
        };
        return methodMap[text] || text;
      },
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
