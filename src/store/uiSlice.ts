import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed: boolean;
  themeMode: 'light' | 'dark';
  themeColor: string;
}

function loadUIState(): UIState {
  try {
    const stored = localStorage.getItem('ui');
    if (stored) {
      return JSON.parse(stored) as UIState;
    }
  } catch {
    // ignore parse errors
  }
  return {
    sidebarCollapsed: false,
    themeMode: 'light',
    themeColor: '#1677ff',
  };
}

function persistUIState(state: UIState) {
  try {
    localStorage.setItem('ui', JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

const initialState: UIState = loadUIState();

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      persistUIState(state);
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
      persistUIState(state);
    },
    setThemeMode(state, action: PayloadAction<'light' | 'dark'>) {
      state.themeMode = action.payload;
      persistUIState(state);
    },
    setThemeColor(state, action: PayloadAction<string>) {
      state.themeColor = action.payload;
      persistUIState(state);
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setThemeMode, setThemeColor } = uiSlice.actions;
export default uiSlice.reducer;
