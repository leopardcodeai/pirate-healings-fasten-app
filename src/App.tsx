import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import QuickConfigPanel from './components/QuickConfigPanel';
import { BiomarkerChart } from './components/BiomarkerChart';
import ProgressRings from './components/ProgressRings';
import VitalsTable from './components/VitalsTable';
import SettingsDrawer from './components/SettingsDrawer';
import DailyLogModal from './components/DailyLogModal';
import PracticesModal from './components/PracticesModal';
import RefeedingGuideModal from './components/RefeedingGuideModal';

function Dashboard() {
  return (
    <div
      style={{ minHeight: '100dvh', background: 'var(--sys-background)' }}
      className="transition-colors duration-300"
    >
      {/* Sticky Header */}
      <Header />

      {/* Main Content */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px 48px' }}>
        {/* Quick Config */}
        <QuickConfigPanel />

        {/* Two-Column Grid: stacks on mobile, 2fr 1fr on lg */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]"
          style={{ gap: 24, marginTop: 24 }}
        >
          {/* Left Column: Chart + Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <BiomarkerChart />
            <VitalsTable />
          </div>

          {/* Right Column: Progress Rings */}
          <div>
            <ProgressRings />
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <SettingsDrawer />
      <DailyLogModal />
      <PracticesModal />
      <RefeedingGuideModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}
