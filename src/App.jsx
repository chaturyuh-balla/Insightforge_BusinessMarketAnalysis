import { Component, useEffect, useState } from 'react';
import {
  AreaChart,
  BarChart3,
  BookOpenText,
  Brain,
  Building2,
  Download,
  FileText,
  History,
  LogOut,
  PieChart as PieIcon,
  Radar as RadarIcon,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { api } from './api';
import { downloadReportPdf } from './reportPdf';

const navItems = [
  { id: 'generator', label: 'Report Generator', icon: Search },
  { id: 'market', label: 'Market Research', icon: FileText },
  { id: 'strategy', label: 'Strategic Analysis', icon: Brain },
  { id: 'evidence', label: 'Evidence & Critic', icon: ShieldCheck },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
];

const pieColors = ['#0f6b7a', '#e0695f', '#3f8f65', '#d99b37'];

export default function App() {
  return (
    <AppErrorBoundary>
      <InsightForgeApp />
    </AppErrorBoundary>
  );
}

function InsightForgeApp() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('signin');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [query, setQuery] = useState('');
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [activeSection, setActiveSection] = useState('generator');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.me()
      .then(({ user }) => {
        setUser(user);
        if (user) loadReports();
      })
      .catch((error) => setMessage(error.message));
  }, []);

  async function loadReports() {
    try {
      const data = await api.getReports();
      const validReports = (data.reports || []).filter(isCompleteReport);
      setReports(validReports);
      if (validReports[0]) setActiveReport(validReports[0]);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = authMode === 'signup' ? await api.signup(authForm) : await api.signin(authForm);
      setUser(data.user);
      await loadReports();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = await api.generateReport(query);
      setActiveReport(data.report);
      setReports((items) => [data.report, ...items]);
      setActiveSection('market');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signout() {
    await api.signout();
    setUser(null);
    setReports([]);
    setActiveReport(null);
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-mist text-ink">
        <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="mb-8 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-ocean text-white">
                <Sparkles size={25} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-ocean">Business Research Platform</p>
                <h1 className="text-4xl font-bold">InsightForge AI</h1>
              </div>
            </div>
            <p className="max-w-2xl text-2xl font-semibold leading-tight">
              Turn a company name or startup idea into market research, strategy, evidence, and executive-ready reports.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {['Groq Model', 'Tavily research', 'Neon history'].map((item) => (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={item}>
                  <p className="text-sm font-semibold text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg bg-white p-7 shadow-soft">
            <div className="mb-5 flex rounded-lg bg-slate-100 p-1">
              <button className={`auth-tab ${authMode === 'signin' ? 'active' : ''}`} onClick={() => setAuthMode('signin')}>Sign In</button>
              <button className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`} onClick={() => setAuthMode('signup')}>Sign Up</button>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <Input label="Name" value={authForm.name} onChange={(value) => setAuthForm({ ...authForm, name: value })} />
              )}
              <Input label="Email" type="email" value={authForm.email} onChange={(value) => setAuthForm({ ...authForm, email: value })} />
              <Input label="Password" type="password" value={authForm.password} onChange={(value) => setAuthForm({ ...authForm, password: value })} />
              {authMode === 'signup' && (
                <Input label="Confirm Password" type="password" value={authForm.confirmPassword} onChange={(value) => setAuthForm({ ...authForm, confirmPassword: value })} />
              )}
              {message && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
              <button className="primary-button w-full" disabled={loading}>
                {loading ? 'Please wait...' : authMode === 'signup' ? 'Create Account' : 'Login'}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mist text-ink">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[1fr_280px]">
        <section className="min-w-0 space-y-5">
          <TopBar user={user} onSignout={signout} />
          <Generator query={query} setQuery={setQuery} loading={loading} message={message} onGenerate={handleGenerate} activeReport={activeReport} />
          {isCompleteReport(activeReport) ? (
            <>
              <MarketSection report={activeReport.report_json} />
              <StrategySection report={activeReport.report_json} />
              <EvidenceSection report={activeReport.report_json} />
              <DashboardSection report={activeReport.report_json} />
            </>
          ) : (
            <EmptyState />
          )}
        </section>
        <RightRail
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          reports={reports}
          setActiveReport={setActiveReport}
          activeReport={activeReport}
          onPdf={() => downloadReportPdf(activeReport)}
        />
      </div>
    </main>
  );
}

function TopBar({ user, onSignout }) {
  return (
    <header className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-ocean text-white">
          <Sparkles />
        </div>
        <div>
          <h1 className="text-2xl font-bold">InsightForge AI</h1>
          <p className="text-sm text-slate-500">Multi-Agent Business Research & Strategy Platform</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <UserRound className="text-ocean" size={22} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
        <button className="icon-button" title="Sign Out" onClick={onSignout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

function RightRail({ activeSection, setActiveSection, reports, activeReport, setActiveReport, onPdf }) {
  return (
    <aside className="right-rail">
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Application Pages</p>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.id} href={`#${item.id}`} onClick={() => setActiveSection(item.id)} className={`rail-link ${activeSection === item.id ? 'active' : ''}`}>
                <Icon size={17} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        <button className="primary-button mt-4 w-full" onClick={onPdf} disabled={!activeReport}>
          <Download size={17} />
          Download PDF Report
        </button>
      </section>
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <History size={17} className="text-ocean" />
          <p className="text-sm font-bold">Session History</p>
        </div>
        <div className="space-y-2">
          {reports.length === 0 && <p className="text-sm text-slate-500">No reports yet.</p>}
          {reports.filter(isCompleteReport).map((item) => (
            <button key={item.id} className="history-item" onClick={() => setActiveReport(item)}>
              <span className="truncate font-semibold">{item.query}</span>
              <span>{new Date(item.created_at).toLocaleString()}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

function Generator({ query, setQuery, loading, message, onGenerate, activeReport }) {
  return (
    <section id="generator" className="panel">
      <SectionTitle icon={Building2} eyebrow="Page 2" title="Report Generator" />
      <form onSubmit={onGenerate} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input className="text-input flex-1" placeholder="Enter Company Name or Startup Idea" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button className="primary-button justify-center" disabled={loading}>
          <Search size={18} />
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </form>
      {message && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
      {activeReport && <p className="mt-3 text-sm text-slate-500">Active report: <span className="font-semibold text-ink">{activeReport.query}</span></p>}
    </section>
  );
}

function MarketSection({ report }) {
  const market = report.marketResearch || {};
  return (
    <section id="market" className="panel">
      <SectionTitle icon={BookOpenText} eyebrow="Page 2" title="Generated Market Research Report" />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoCard title="Industry Overview" text={market.industryOverview} />
        <InfoCard title="Market Size Classification" text={market.marketSizeClassification} badge />
        <ListCard title="Growth Trends" items={market.growthTrends || []} />
        <ListCard title="Customer Segments" items={market.customerSegments || []} />
        <ListCard title="Customer Pain Points" items={market.painPoints || []} />
        <ListCard title="Risks & Challenges" items={market.risksChallenges || []} />
        <ListCard title="Emerging Technologies & Trends" items={market.emergingTechnologies || []} wide />
      </div>
    </section>
  );
}

function StrategySection({ report }) {
  const strategy = report.strategicAnalysis || {};
  return (
    <section id="strategy" className="panel">
      <SectionTitle icon={Brain} eyebrow="Page 3" title="Strategic Analysis" />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <QuadCard title="SWOT Analysis" groups={strategy.swot || {}} />
        <QuadCard title="Competitor Analysis" groups={strategy.competitors || {}} />
        <QuadCard title="Pricing Analysis" groups={strategy.pricing || {}} />
        <QuadCard title="Go-To-Market Strategy" groups={strategy.goToMarket || {}} />
      </div>
    </section>
  );
}

function EvidenceSection({ report }) {
  return (
    <section id="evidence" className="panel">
      <SectionTitle icon={ShieldCheck} eyebrow="Page 4" title="Evidence & Critic Review" />
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200">
          {(report.evidence || []).map((source) => (
            <a className="source-row" href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <span className="text-xs font-bold text-ocean">[{source.id}]</span>
              <span>
                <strong>{source.title}</strong>
                <small>{source.summary}</small>
              </span>
            </a>
          ))}
        </div>
        <div className="space-y-4">
          <ListCard title="Citations Section" items={(report.citations || []).map((item) => `${item.label} ${item.title}`)} />
          <QuadCard title="Critic Section" groups={report.critic || {}} />
        </div>
      </div>
    </section>
  );
}

function DashboardSection({ report }) {
  return (
    <section id="dashboard" className="panel">
      <SectionTitle icon={AreaChart} eyebrow="Page 5" title="Dashboard" />
      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <ChartCard title="SWOT Pie Chart" icon={PieIcon}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={report.dashboard?.swotDistribution || []} dataKey="value" nameKey="name" outerRadius={82} label>
                {(report.dashboard?.swotDistribution || []).map((_, index) => <Cell key={index} fill={pieColors[index % pieColors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Competitor Comparison Bar Chart" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={report.dashboard?.competitorComparison || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0f6b7a" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Business Readiness Radar Chart" icon={RadarIcon}>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={report.dashboard?.readiness || []}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar dataKey="score" stroke="#e0695f" fill="#e0695f" fillOpacity={0.35} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="panel grid min-h-[260px] place-items-center text-center">
      <div>
        <Sparkles className="mx-auto mb-3 text-ocean" size={36} />
        <h2 className="text-xl font-bold">Generate your first business intelligence report</h2>
        <p className="mt-2 text-slate-500">Enter a company or idea to unlock research, strategy, evidence, and dashboard views.</p>
      </div>
    </section>
  );
}

function SectionTitle({ icon: Icon, eyebrow, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-ocean/10 text-ocean">
        <Icon size={21} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{eyebrow}</p>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input className="text-input w-full" type={type} value={value} onChange={(event) => onChange(event.target.value)} required />
    </label>
  );
}

function InfoCard({ title, text, badge }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      {badge ? <span className="classification-badge">{text}</span> : <p>{text}</p>}
    </article>
  );
}

function ListCard({ title, items = [], wide }) {
  return (
    <article className={`card ${wide ? 'lg:col-span-2' : ''}`}>
      <h3>{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </article>
  );
}

function QuadCard({ title, groups }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <div className="mt-3 space-y-3">
        {Object.entries(groups || {}).map(([key, value]) => (
          <div key={key}>
            <p className="text-sm font-bold capitalize text-ocean">{formatKey(key)}</p>
            <ul className="mt-1 space-y-1">
              {(Array.isArray(value) ? value : [value]).map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <article className="card min-h-[330px]">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} className="text-ocean" />
        <h3>{title}</h3>
      </div>
      {children}
    </article>
  );
}

function formatKey(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function isCompleteReport(item) {
  const report = item?.report_json;
  return Boolean(
    item &&
      report &&
      report.marketResearch &&
      report.strategicAnalysis &&
      report.critic &&
      report.dashboard &&
      Array.isArray(report.evidence) &&
      Array.isArray(report.citations)
  );
}

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-mist px-5 text-ink">
          <section className="max-w-lg rounded-lg bg-white p-6 shadow-soft">
            <h1 className="text-xl font-bold">InsightForge AI</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The interface hit a rendering error. Clear older saved reports or restart the dev server, then try again.
            </p>
            <pre className="mt-4 overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-red-700">{this.state.error.message}</pre>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
