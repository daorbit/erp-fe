import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ICompanySwitcherEntry {
  _id: string;
  name: string;
  code: string;
  logo?: string;
  isActive: boolean;
  parentCompany?: string;
  isCurrent: boolean;
}

interface ActiveCompanyState {
  activeCompanyId: string | null;
  groupCompanies: ICompanySwitcherEntry[];
}

function loadActiveCompanyId(): string | null {
  try {
    return localStorage.getItem('activeCompanyId');
  } catch {
    return null;
  }
}

const initialState: ActiveCompanyState = {
  activeCompanyId: loadActiveCompanyId(),
  groupCompanies: [],
};

const activeCompanySlice = createSlice({
  name: 'activeCompany',
  initialState,
  reducers: {
    setActiveCompany(state, action: PayloadAction<string>) {
      state.activeCompanyId = action.payload;
      // Update isCurrent flag in the cached list
      state.groupCompanies = state.groupCompanies.map((c) => ({
        ...c,
        isCurrent: c._id === action.payload,
      }));
      localStorage.setItem('activeCompanyId', action.payload);
    },
    setGroupCompanies(state, action: PayloadAction<ICompanySwitcherEntry[]>) {
      state.groupCompanies = action.payload;
    },
    clearActiveCompany(state) {
      state.activeCompanyId = null;
      state.groupCompanies = [];
      localStorage.removeItem('activeCompanyId');
    },
  },
});

export const { setActiveCompany, setGroupCompanies, clearActiveCompany } =
  activeCompanySlice.actions;
export default activeCompanySlice.reducer;
