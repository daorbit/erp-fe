import React, { useState } from 'react';
import { Alert, Card, Typography, Button, Radio, Input, Table } from 'antd';
import { SiteTreeFilter, useSiteTree } from './_shared';

const { Title, Text } = Typography;

const VOUCHER_COLS = [
  'Indent', 'PO', 'GRN', 'Mat.Issue', 'Purchase', 'Payment', 'Payment Approval',
  'Receipt', 'Receipt Approval', 'Journal', 'Journal Approval', 'Contra', 'Contra Approval',
  'Attendance', 'Pur. Posting', 'Salary Generated', 'Salary Posting', 'Log Book',
  'NIT', 'Tender', 'BID', 'Tender BG/FDR', 'RMC Challan', 'Machine Working', 'Machine Status',
];

export default function VoucherStatusReport() {
  const [siteIds, setSiteIds] = useState<string[]>([]);
  const [reportType, setReportType] = useState<'html' | 'excel' | 'pdf'>('html');
  const [showResults, setShowResults] = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const setCol = (k: string, v: string) => setColFilters((p) => ({ ...p, [k]: v }));
  const filterCell = (k: string) => (
    <Input size="small" value={colFilters[k] || ''} onChange={(e) => setCol(k, e.target.value)} />
  );

  const { branches, resolveCompanyName } = useSiteTree();

  // One row per selected site (or all sites if none selected). Voucher-status
  // aggregation is not yet exposed by the backend, so each voucher cell stays
  // blank — see the alert above the table.
  const rows = (siteIds.length > 0 ? branches.filter((b) => siteIds.includes(b._id)) : branches).map((b) => {
    const row: any = { _id: b._id, company: resolveCompanyName(b.company), siteName: b.name };
    for (const c of VOUCHER_COLS) row[c] = '—';
    return row;
  });

  return (
    <div className="space-y-4">
      <Title level={4} className="!mb-0">Voucher Status</Title>

      <Card bordered={false} className="!rounded-lg !shadow-sm" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-right">Company -Site</span>
            <SiteTreeFilter value={siteIds} onChange={setSiteIds} />
          </div>
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-xs font-medium text-right">Report Type</span>
            <Radio.Group size="small" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <Radio value="html">HTML</Radio>
              <Radio value="excel">Excel</Radio>
              <Radio value="pdf">PDF</Radio>
            </Radio.Group>
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-3">
          <Button type="primary" danger onClick={() => setShowResults(true)}>Search</Button>
          <Button danger onClick={() => setShowResults(false)}>Close</Button>
        </div>
      </Card>

      {showResults && (
        <Card bordered={false} className="!rounded-lg !shadow-sm">
          <Alert
            type="info"
            showIcon
            className="mb-3"
            message="Voucher status aggregation is not yet available on the server."
            description="The grid below lists the configured sites and voucher columns. Last-entry dates will appear here once the backend report endpoint is wired up."
          />
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Total {rows.length} Record</div>
            <Text type="danger" className="text-xs font-medium">
              Status of Last Entry date in particular option - Company/Site wise
            </Text>
          </div>
          <Table
            dataSource={rows}
            rowKey="_id"
            size="small"
            scroll={{ x: 4000 }}
            pagination={false}
            columns={[
              { title: <div><div>S.No</div>{filterCell('sr')}</div>, key: 'sr', width: 70, fixed: 'left' as const,
                render: (_, __, i) => i + 1 },
              { title: <div><div>Company Name</div>{filterCell('company')}</div>, dataIndex: 'company', key: 'company', width: 180, fixed: 'left' as const },
              { title: <div><div>Site Name</div>{filterCell('siteName')}</div>, dataIndex: 'siteName', key: 'siteName', width: 160, fixed: 'left' as const },
              ...VOUCHER_COLS.map((c) => ({
                title: <div><div>{c}</div>{filterCell(c)}</div>,
                dataIndex: c, key: c, width: 130,
              })),
            ]}
          />
        </Card>
      )}
    </div>
  );
}
