import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AnimationLevel = 'none' | 'minimal' | 'full';
export type FontSize = 'small' | 'default' | 'large';
export type BorderRadius = 'none' | 'small' | 'default' | 'large';

interface UIState {
  sidebarCollapsed: boolean;
  themeMode: 'light' | 'dark';
  themeColor: string;
  fontFamily: string;
  language: 'en' | 'es' | 'hi';
  fontSize: FontSize;
  animationLevel: AnimationLevel;
  borderRadius: BorderRadius;
  compactMode: boolean;
  bgStyle: string;
}

function loadUIState(): UIState {
  try {
    const stored = localStorage.getItem('ui');
    if (stored) return { ...getDefaults(), ...JSON.parse(stored) } as UIState;
  } catch { /* ignore */ }
  return getDefaults();
}

function getDefaults(): UIState {
  return {
    sidebarCollapsed: false,
    themeMode: 'light',
    themeColor: 'blue',
    fontFamily: "'Inter', sans-serif",
    language: 'en',
    fontSize: 'default',
    animationLevel: 'full',
    borderRadius: 'default',
    compactMode: false,
    bgStyle: 'default',
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
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload as any;
      persistUIState(state);
    },
    setFontSize(state, action: PayloadAction<FontSize>) {
      state.fontSize = action.payload;
      persistUIState(state);
    },
    setAnimationLevel(state, action: PayloadAction<AnimationLevel>) {
      state.animationLevel = action.payload;
      persistUIState(state);
    },
    setBorderRadius(state, action: PayloadAction<BorderRadius>) {
      state.borderRadius = action.payload;
      persistUIState(state);
    },
    setCompactMode(state, action: PayloadAction<boolean>) {
      state.compactMode = action.payload;
      persistUIState(state);
    },
    setBgStyle(state, action: PayloadAction<string>) {
      state.bgStyle = action.payload;
      persistUIState(state);
    },
  },
});

export const {
  toggleSidebar, setSidebarCollapsed, setThemeMode, setThemeColor,
  setFontFamily, setLanguage, setFontSize, setAnimationLevel,
  setBorderRadius, setCompactMode, setBgStyle,
} = uiSlice.actions;
export default uiSlice.reducer;
