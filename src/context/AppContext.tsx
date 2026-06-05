/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  type Profile, type PhaseConfig, type ChartDataPoint,
  generateChartData, BIOMARKER_COLORS, BIOMARKER_LABELS, BIOMARKER_UNITS,
} from '../data/biomarkerModel';
import { buildPhases, getPhaseProgress, getFastingCompletionPercent, getProtocolName, type PhaseInfo } from '../data/fastingModel';
import { calculateTBW, calculateWaterTarget, simulateHydration, type WaterEntry } from '../data/hydrationModel';

// ─── Types ──────────────────────────────────────────────────────────
export interface DailyLogEntry {
  id: string;
  date: string;
  glucose: number;
  ketones: number;
  weight: number;
  sleep: number;
  energy: number;
  electrolytes: { na: boolean; k: boolean; mg: boolean };
  symptoms: { headache: boolean; dizziness: boolean; nausea: boolean; fatigue: boolean; insomnia: boolean };
}

export type ThemeMode = 'light' | 'dark' | 'system';

const ALL_BIOMARKERS = [
  'glucose', 'insulin', 'glycogen', 'autophagy', 'ketones',
  'ghrelin', 'stemCellsIntestinal', 'stemCellsHematopoietic', 'immuneReboot', 'hydration',
] as const;

// ─── Storage Keys ───────────────────────────────────────────────────
const STORAGE_KEYS = {
  profile: 'fastflow_profile',
  protocol: 'fastflow_protocol',
  dailyLogs: 'fastflow_daily_logs',
  waterEntries: 'fastflow_water_entries',
  activeLines: 'fastflow_active_lines',
  theme: 'fastflow_theme',
  fastStart: 'fastflow_fast_start',
} as const;

// ─── Helpers ────────────────────────────────────────────────────────
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* localStorage full or unavailable */ }
}

// ─── Default Values ─────────────────────────────────────────────────
const defaultProfile: Profile = {
  gender: 'male',
  weight: 82,
  height: 182,
  age: 37,
  bodyType: 'athletic',
};

const defaultProtocol: PhaseConfig = {
  preFastHours: 6,
  fastDuration: 120,
  refeedDays: 3,
};

const defaultActiveLines: Record<string, boolean> = Object.fromEntries(
  ALL_BIOMARKERS.map(k => [k, true])
);

function getDefaultFastStart(): string {
  const d = new Date();
  d.setHours(d.getHours() - 14);
  return d.toISOString();
}

// ─── Context Shape ──────────────────────────────────────────────────
interface AppContextValue {
  // Profile
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;

  // Protocol
  protocol: PhaseConfig;
  updateProtocol: (updates: Partial<PhaseConfig>) => void;
  fastStart: string;
  setFastStart: (iso: string) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  isDark: boolean;

  // Biomarker toggles
  activeLines: Record<string, boolean>;
  toggleLine: (key: string) => void;

  // Daily logs
  dailyLogs: DailyLogEntry[];
  addDailyLog: (log: DailyLogEntry) => void;
  deleteDailyLog: (id: string) => void;

  // Water
  waterEntries: WaterEntry[];
  addWaterEntry: (amount: number) => void;
  deleteWaterEntry: (id: string) => void;

  // Computed
  totalHours: number;
  hoursElapsed: number;
  tbw: number;
  waterTarget: number;
  hydrationData: number[];
  currentHydration: number;
  chartData: ChartDataPoint[];
  phases: PhaseInfo[];
  fastingCompletionPercent: number;
  protocolName: string;
  currentPhaseInfo: { phase: PhaseInfo | null; phaseProgress: number; overallProgress: number };

  // UI state
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  showDailyLog: boolean;
  setShowDailyLog: (v: boolean) => void;
  showPractices: boolean;
  setShowPractices: (v: boolean) => void;
  showRefeedGuide: boolean;
  setShowRefeedGuide: (v: boolean) => void;

  // Reset
  resetState: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  // ── Persisted state ─────────────────
  const [profile, setProfile] = useState<Profile>(() => loadJSON(STORAGE_KEYS.profile, defaultProfile));
  const [protocol, setProtocol] = useState<PhaseConfig>(() => loadJSON(STORAGE_KEYS.protocol, defaultProtocol));
  const [fastStart, setFastStartState] = useState<string>(() => loadJSON(STORAGE_KEYS.fastStart, getDefaultFastStart()));
  const [dailyLogs, setDailyLogs] = useState<DailyLogEntry[]>(() => loadJSON(STORAGE_KEYS.dailyLogs, []));
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>(() => loadJSON(STORAGE_KEYS.waterEntries, []));
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>(() => loadJSON(STORAGE_KEYS.activeLines, defaultActiveLines));
  const [theme, setThemeState] = useState<ThemeMode>(() => loadJSON(STORAGE_KEYS.theme, 'system'));

  // ── Transient state ─────────────────
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [showPractices, setShowPractices] = useState(false);
  const [showRefeedGuide, setShowRefeedGuide] = useState(false);

  // ── Clock tick (every 60s) ──────────
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── System theme listener ──────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Resolve dark mode ──────────────
  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  // ── Apply .dark class to <html> ────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // ── Persist on change ──────────────
  useEffect(() => { saveJSON(STORAGE_KEYS.profile, profile); }, [profile]);
  useEffect(() => { saveJSON(STORAGE_KEYS.protocol, protocol); }, [protocol]);
  useEffect(() => { saveJSON(STORAGE_KEYS.fastStart, fastStart); }, [fastStart]);
  useEffect(() => { saveJSON(STORAGE_KEYS.dailyLogs, dailyLogs); }, [dailyLogs]);
  useEffect(() => { saveJSON(STORAGE_KEYS.waterEntries, waterEntries); }, [waterEntries]);
  useEffect(() => { saveJSON(STORAGE_KEYS.activeLines, activeLines); }, [activeLines]);
  useEffect(() => { saveJSON(STORAGE_KEYS.theme, theme); }, [theme]);

  // ── Actions ────────────────────────
  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const updateProtocol = useCallback((updates: Partial<PhaseConfig>) => {
    setProtocol(prev => ({ ...prev, ...updates }));
  }, []);

  const setFastStart = useCallback((iso: string) => {
    setFastStartState(iso);
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
  }, []);

  const toggleLine = useCallback((key: string) => {
    setActiveLines(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const addDailyLog = useCallback((log: DailyLogEntry) => {
    setDailyLogs(prev => [log, ...prev]);
  }, []);

  const deleteDailyLog = useCallback((id: string) => {
    setDailyLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  const addWaterEntry = useCallback((amount: number) => {
    const entry: WaterEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      amount: amount / 1000, // convert ml to liters
    };
    setWaterEntries(prev => [...prev, entry]);
  }, []);

  const deleteWaterEntry = useCallback((id: string) => {
    setWaterEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const resetState = useCallback(() => {
    setProfile(defaultProfile);
    setProtocol(defaultProtocol);
    setFastStartState(getDefaultFastStart());
    setDailyLogs([]);
    setWaterEntries([]);
    setActiveLines(defaultActiveLines);
    setThemeState('system');
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  }, []);

  // ── Computed values ────────────────
  const totalHours = useMemo(() =>
    protocol.preFastHours + protocol.fastDuration + protocol.refeedDays * 24,
    [protocol]
  );

  const hoursElapsed = useMemo(() => {
    const elapsed = (currentTime - new Date(fastStart).getTime()) / 3_600_000;
    return Math.max(0, elapsed);
  }, [currentTime, fastStart]);

  const tbw = useMemo(() => calculateTBW(profile), [profile]);
  const waterTarget = useMemo(() => calculateWaterTarget(profile), [profile]);

  const hydrationData = useMemo(() =>
    simulateHydration(totalHours, tbw, waterEntries, fastStart, protocol.preFastHours),
    [totalHours, tbw, waterEntries, fastStart, protocol.preFastHours]
  );

  const currentHydration = useMemo(() => {
    const idx = Math.min(Math.floor(hoursElapsed), hydrationData.length - 1);
    return idx >= 0 ? hydrationData[idx] : 100;
  }, [hoursElapsed, hydrationData]);

  const chartData = useMemo(() =>
    generateChartData(totalHours, protocol, profile, hydrationData),
    [totalHours, protocol, profile, hydrationData]
  );

  const phases = useMemo(() => buildPhases(protocol), [protocol]);

  const fastingCompletionPercent = useMemo(() =>
    getFastingCompletionPercent(hoursElapsed, protocol.preFastHours, protocol.fastDuration),
    [hoursElapsed, protocol]
  );

  const protocolName = useMemo(() => getProtocolName(protocol.fastDuration), [protocol.fastDuration]);

  const currentPhaseInfo = useMemo(() =>
    getPhaseProgress(phases, hoursElapsed),
    [phases, hoursElapsed]
  );

  // ── Context value ──────────────────
  const value: AppContextValue = {
    profile, updateProfile,
    protocol, updateProtocol,
    fastStart, setFastStart,
    theme, setTheme, isDark,
    activeLines, toggleLine,
    dailyLogs, addDailyLog, deleteDailyLog,
    waterEntries, addWaterEntry, deleteWaterEntry,
    totalHours, hoursElapsed,
    tbw, waterTarget, hydrationData, currentHydration,
    chartData, phases, fastingCompletionPercent, protocolName, currentPhaseInfo,
    showSettings, setShowSettings,
    showDailyLog, setShowDailyLog,
    showPractices, setShowPractices,
    showRefeedGuide, setShowRefeedGuide,
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Re-export for convenience
export { BIOMARKER_COLORS, BIOMARKER_LABELS, BIOMARKER_UNITS, ALL_BIOMARKERS };
export type { Profile, PhaseConfig, ChartDataPoint, WaterEntry, PhaseInfo };
