import { Button, Empty, Input, Modal, Select, Space, Table, Tag, message } from 'antd';
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

export function SimilarityTable({ bim, on, refresh }: SimilarityTableProps) {
  const [messageApi, contextHolder] = message.useMessage();

  const [originalData, setOriginalData] = useState<SimilarityData[]>([]);
  const [data, setData] = useState<SimilarityData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [targetFilter, setTargetFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지 상태 추가

  const [delimiter, setDelimiter] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleAddDelimiter = () => {
    if (inputValue && !delimiter.includes(inputValue)) {
      setDelimiter([...delimiter, inputValue]);
      setInputValue('');
    }
  };

  const handleRemoveDelimiter = (value: string) => {
    setDelimiter(delimiter.filter((item) => item !== value));
  };

  // 고유한 대상 및 계산법 옵션 추출
  const targetOptions = Array.from(new Set(originalData.map((item) => item.target))).map(
    (target) => ({ label: target, value: target }),
  );

  const methodOptions = Array.from(new Set(originalData.map((item) => item.method))).map(
    (method) => {
      const methodMap: Record<string, string> = {
        jaccard: '자카드 유사도',
        cosine: '코사인 유사도',
        levenshtein: '레벤슈타인 거리',
      };
      return {
        label: methodMap[method] || method,
        value: method,
      };
    },
  );

  useEffect(() => {
    fetchData();
  }, [bim, on, refresh]);

  // 검색어 또는 필터가 변경될 때마다 데이터 필터링
  useEffect(() => {
    filterData();
  }, [searchText, targetFilter, methodFilter, originalData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/similarity/read?bim=${bim}&on=${on}`);

      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      setOriginalData(result);
      filterData(result);
    } catch (error) {
      console.error('유사도 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = (dataSource = originalData) => {
    let filtered = [...dataSource];

    // 검색어 필터링
    if (searchText && searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.propertySet.toLowerCase().includes(searchLower) ||
          item.propertyName.toLowerCase().includes(searchLower) ||
          item.propertyValue.toLowerCase().includes(searchLower),
      );
    }

    // 대상 필터링
    if (targetFilter) {
      filtered = filtered.filter((item) => item.target === targetFilter);
    }

    // 계산법 필터링
    if (methodFilter) {
      filtered = filtered.filter((item) => item.method === methodFilter);
    }

    setData(filtered);
    setCurrentPage(1); // 필터링할 때마다 페이지를 1로 리셋
  };

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

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/similarity/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionName: decodeURIComponent(bim),
          objectName: decodeURIComponent(on),
          delimiter: delimiter,
        }),
      });

      if (response.ok) {
        messageApi.success('분석이 완료되었습니다.');
        fetchData();
      } else {
        const errorData = await response.json();
        messageApi.error(`분석 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      messageApi.error('분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <Space>
        <Input
          placeholder="속성세트, 속성명, 속성값 검색"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          value={searchText}
        />
        <Select
          placeholder="대상 선택"
          options={targetOptions}
          onChange={(value) => setTargetFilter(value)}
          style={{ width: 150 }}
          value={targetFilter}
          allowClear
        />
        <Select
          placeholder="계산법 선택"
          options={methodOptions}
          onChange={(value) => setMethodFilter(value)}
          style={{ width: 150 }}
          value={methodFilter}
          allowClear
        />

        <Button
          onClick={() => {
            setSearchText('');
            setTargetFilter(null);
            setMethodFilter(null);
          }}
        >
          초기화
        </Button>

        <Button type="default" onClick={() => setModalVisible(true)}>
          구분자 설정
        </Button>
      </Space>

      {/* 구분자 설정 모달 */}
      <Modal
        title="구분자 설정"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            닫기
          </Button>,
          <Button
            key="analyze"
            type="primary"
            onClick={() => {
              handleAnalyze();
              setModalVisible(false);
            }}
          >
            분석하기
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <Space>
            <Input
              placeholder="구분자 입력 (예: ,)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleAddDelimiter}
            />
            <Button type="primary" onClick={handleAddDelimiter}>
              추가
            </Button>
          </Space>

          <div className="mt-2 flex flex-wrap gap-1">
            {delimiter.map((d) => (
              <Tag
                key={d}
                closable
                onClick={() => handleRemoveDelimiter(d)}
                className="cursor-pointer"
              >
                {d === ' ' ? '공백' : d}
              </Tag>
            ))}
          </div>
        </Space>
      </Modal>

      <Table
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          position: ['bottomCenter'],
          current: currentPage, // 현재 페이지 설정
          onChange: (page) => setCurrentPage(page), // 페이지 변경 이벤트 핸들러
        }}
        bordered
        scroll={{ x: 1000 }}
        locale={{
          emptyText: loading ? (
            <Empty />
          ) : (
            <Button type="primary" onClick={handleAnalyze}>
              데이터 불러오기
            </Button>
          ),
        }}
      />
    </>
  );
}
