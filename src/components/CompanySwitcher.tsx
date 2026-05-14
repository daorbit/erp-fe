import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Avatar, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import companyService from '@/services/companyService';
import { setActiveCompany, setGroupCompanies } from '@/store/activeCompanySlice';
import type { ICompanySwitcherEntry } from '@/store/activeCompanySlice';
import { queryClient } from '@/config/queryClient';
import type { RootState } from '@/store';

export default function CompanySwitcher() {
  const dispatch = useDispatch();
  const { activeCompanyId, groupCompanies } = useSelector(
    (state: RootState) => state.activeCompany,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const isDark = useSelector((state: RootState) => state.ui?.themeMode === 'dark');

  const { data } = useQuery({
    queryKey: ['companies', 'group'],
    queryFn: () => companyService.getGroup(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!data?.data) return;
    const companies = data.data as ICompanySwitcherEntry[];
    dispatch(setGroupCompanies(companies));

    // Initialise the active company on first load:
    // prefer the stored id; fall back to the user's own company
    const storedId = activeCompanyId;
    const validId = companies.find((c) => c._id === storedId)?._id;
    if (!validId) {
      const userCompanyId =
        typeof user?.company === 'string' ? user.company : (user?.company as any)?._id;
      const defaultCompany = companies.find((c) => c._id === userCompanyId) ?? companies[0];
      if (defaultCompany) {
        dispatch(setActiveCompany(defaultCompany._id));
      }
    }
  }, [data]);

  // Only show the switcher when there are multiple companies
  if (groupCompanies.length <= 1) return null;

  const currentCompany = groupCompanies.find((c) => c._id === activeCompanyId);

  const handleSwitch = (companyId: string) => {
    if (companyId === activeCompanyId) return;
    dispatch(setActiveCompany(companyId));
    // Invalidate all queries so every list/form refreshes with the new context
    queryClient.invalidateQueries();
  };

  const menuItems: MenuProps['items'] = groupCompanies.map((company) => ({
    key: company._id,
    label: (
      <div className="flex items-center justify-between gap-3 min-w-[180px]">
        <div className="flex items-center gap-2">
          {company.logo ? (
            <Avatar src={company.logo} size={20} />
          ) : (
            <Avatar icon={<Building2 size={12} />} size={20} />
          )}
          <div>
            <div className="text-sm font-medium leading-tight">{company.name}</div>
            <div className="text-xs text-gray-400">{company.code}</div>
          </div>
        </div>
        {company._id === activeCompanyId && (
          <Check size={14} className="text-blue-500 flex-shrink-0" />
        )}
      </div>
    ),
    onClick: () => handleSwitch(company._id),
    disabled: !company.isActive,
  }));

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
      <button
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer border ${
          isDark
            ? 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
      >
        {currentCompany?.logo ? (
          <Avatar src={currentCompany.logo} size={16} />
        ) : (
          <Building2 size={14} />
        )}
        <span className="max-w-[120px] truncate">{currentCompany?.name ?? 'Select Company'}</span>
        {currentCompany && !currentCompany.parentCompany && (
          <Tag color="blue" className="text-[10px] px-1 py-0 leading-tight ml-0.5">
            Parent
          </Tag>
        )}
        <ChevronDown size={13} className="opacity-60" />
      </button>
    </Dropdown>
  );
}
