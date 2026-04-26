import React, { useMemo, useState } from 'react';
import { Input, Select, TreeSelect } from 'antd';
import { Search } from 'lucide-react';
import type { SelectProps, TreeSelectProps } from 'antd';

/**
 * Shared dropdown UI used across master filters.
 * - Count badge box on the right (legacy NwayERP look).
 * - CountedTreeSelect adds a dedicated search input at the top of the dropdown
 *   panel that *filters* the visible tree (keeps an ancestor only if any
 *   descendant matches), instead of just highlighting matches.
 */

function CountBadge({ count }: { count: number }) {
  return (
    <div
      className="flex items-center justify-center border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium shrink-0"
      style={{ width: 32, height: 24 }}
      title={`${count} selected`}
    >
      {count}
    </div>
  );
}

type TreeNode = {
  title?: React.ReactNode;
  value?: string | number;
  children?: TreeNode[];
  [k: string]: any;
};

function filterTree(nodes: TreeNode[] | undefined, q: string): TreeNode[] {
  if (!nodes || !q) return nodes ?? [];
  const lower = q.toLowerCase();
  const walk = (list: TreeNode[]): TreeNode[] => {
    const out: TreeNode[] = [];
    for (const n of list) {
      const childMatches = n.children ? walk(n.children) : [];
      const selfMatches = String(n.title ?? '').toLowerCase().includes(lower);
      if (selfMatches || childMatches.length > 0) {
        out.push({ ...n, children: childMatches.length > 0 ? childMatches : n.children });
      }
    }
    return out;
  };
  return walk(nodes);
}

export function CountedTreeSelect(props: TreeSelectProps<any>) {
  const { value, treeData, ...rest } = props;
  const count = Array.isArray(value) ? value.length : value ? 1 : 0;
  const [search, setSearch] = useState('');

  const visibleTree = useMemo(
    () => filterTree(treeData as TreeNode[], search),
    [treeData, search],
  );

  return (
    <div className="flex items-center gap-1 w-full">
      <TreeSelect
        size="small"
        treeCheckable
        showCheckedStrategy={TreeSelect.SHOW_CHILD}
        treeNodeLabelProp="title"
        maxTagCount="responsive"
        allowClear
        // We do filtering ourselves via popupRender, so disable built-in search
        // typing in the selector and rely on the dedicated input.
        showSearch={false}
        treeLine={false}
        treeDefaultExpandAll
        popupClassName="counted-tree-popup"
        style={{ width: '100%' }}
        value={value}
        treeData={visibleTree}
        popupRender={(menu) => (
          <div>
            <div className="px-2 pt-2 pb-1 sticky top-0 bg-white dark:bg-[#1f1f1f] z-10">
              <Input
                size="small"
                allowClear
                autoFocus
                prefix={<Search size={12} className="text-gray-400" />}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {menu}
          </div>
        )}
        onDropdownVisibleChange={(open) => { if (!open) setSearch(''); }}
        {...rest}
      />
      <CountBadge count={count} />
    </div>
  );
}

export function CountedSelect(props: SelectProps<any>) {
  const { value, mode, ...rest } = props;
  const count = Array.isArray(value) ? value.length : value ? 1 : 0;
  return (
    <div className="flex items-center gap-1 w-full">
      <Select
        size="small"
        mode={mode}
        maxTagCount="responsive"
        allowClear
        showSearch
        optionFilterProp="label"
        style={{ width: '100%' }}
        value={value}
        {...rest}
      />
      <CountBadge count={count} />
    </div>
  );
}
