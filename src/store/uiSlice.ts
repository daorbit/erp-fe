import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed: boolean;
  themeMode: 'light' | 'dark';
  themeColor: string;
  fontFamily: string;
}

function loadUIState(): UIState {
  try {
    const stored = localStorage.getItem('ui');
    if (stored) return JSON.parse(stored) as UIState;
  } catch { /* ignore */ }
  return {
    sidebarCollapsed: false,
    themeMode: 'light',
    themeColor: 'green',
    fontFamily: "'Inter', sans-serif",
  };
}

function persistUIState(state: UIState) {
  try { localStorage.setItem('ui', JSON.stringify(state)); } catch { /* ignore */ }
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
    setFontFamily(state, action: PayloadAction<string>) {
      state.fontFamily = action.payload;
      persistUIState(state);
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setThemeMode, setThemeColor, setFontFamily } = uiSlice.actions;
export default uiSlice.reducer;
