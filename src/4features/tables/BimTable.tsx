import { Input, Space, Table } from 'antd';

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
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchCollections = async (page: number, pageSize: number, search: string = '') => {
    try {
      setLoading(true);
      const searchParam = search ? `&search=${search}` : '';
      const response = await fetch(
        `/api/bim/read/all?page=${page}&pageSize=${pageSize}${searchParam}`,
      );
      if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
      const data = await response.json();
      setCollections(data.items || []);
      setPagination({
        ...pagination,
        current: page,
        total: data.total || 0,
      });
    } catch (error) {
      console.error('컬렉션 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections(pagination.current, pagination.pageSize, searchText);
  }, [refresh]); // refresh 값이 바뀔 때마다 데이터를 다시 불러옵니다

  const handleTableChange = (newPagination: any) => {
    if (newPagination.current && newPagination.pageSize) {
      fetchCollections(newPagination.current, newPagination.pageSize, searchText);
    }
  };

  const handleSearch = () => {
    fetchCollections(1, pagination.pageSize, searchText);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const columns = [
    {
      title: '컬렉션 이름',
      dataIndex: 'name',
      key: 'name',
    },
  ];

  return (
    <>
      <Space>
        <Input.Search
          placeholder="컬렉션 검색"
          value={searchText}
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
          onClick: () => router.push(`/${record.name}`),
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
