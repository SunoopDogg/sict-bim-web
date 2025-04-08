import { Input, Space, Table } from 'antd';

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
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  async function fetchCollections(page: number, pageSize: number, search: string = '') {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/bim/read?dbName=bim&collectionName=${bim}&page=${page}&pageSize=${pageSize}&search=${search}`,
      );

      if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
      const data = await response.json();

      setCollections(
        data.items.map((item: any) => ({
          name: item.Name,
        })),
      );
      setPagination({
        ...pagination,
        current: page,
        total: data.total || 0,
      });
    } catch (error) {
      console.error('객체 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCollections(pagination.current, pagination.pageSize, searchText);
  }, [bim]);

  const handleTableChange = (newPagination: any) => {
    fetchCollections(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = () => {
    fetchCollections(1, pagination.pageSize, searchText);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: '객체 이름',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  return (
    <>
      <Space>
        <Input.Search
          placeholder="객체 이름 검색"
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          onPressEnter={handleSearch}
          allowClear
        />
      </Space>

      <Table
        dataSource={collections}
        columns={columns}
        loading={loading}
        rowKey="name"
        bordered
        onRow={(record, index) => ({
          onClick: () => router.push(`/${bim}/${record.name}`),
          style: {
            cursor: 'pointer',
            backgroundColor: index !== undefined && index % 2 === 0 ? '#ffffff' : '#fafafa',
          },
        })}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          position: ['bottomCenter'],
        }}
        onChange={handleTableChange}
      />
    </>
  );
}
