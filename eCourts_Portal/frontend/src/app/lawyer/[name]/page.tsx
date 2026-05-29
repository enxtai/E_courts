"use client";

import React, { useEffect, useState, use } from 'react';
import {
  Scale, Search, Home, ChevronRight, Briefcase, MapPin, Calendar,
  Trophy, Activity, Star, CheckCircle2, ChevronDown, Gavel, ShieldCheck, Mail, Clock, Sparkles, FileText
} from 'lucide-react';
import Link from 'next/link';

export default function LawyerProfile({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const lawyerName = decodeURIComponent(name);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    fetch(`${API_BASE}/lawyer/${encodeURIComponent(lawyerName)}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [lawyerName]);

  const [uniqueJudges, setUniqueJudges] = useState<string[]>([]);
  const [selectedJudge, setSelectedJudge] = useState<string>('');
  const [winRatioData, setWinRatioData] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (data && data.cases) {
      const judgesSet = new Set<string>();
      data.cases.forEach((c: any) => {
        if (c.judges) {
          c.judges.split(',').forEach((j: string) => {
            const trimmed = j.trim();
            if (trimmed && trimmed.length > 2) judgesSet.add(trimmed);
          });
        }
      });
      const unique = Array.from(judgesSet).sort();
      setUniqueJudges(unique);
      if (unique.length === 0) {
        setSelectedJudge("ALL");
      }
    }
  }, [data]);

  const handleAnalyze = async () => {
    if (!selectedJudge) return;
    setAnalyzing(true);
    setWinRatioData(null);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${API_BASE}/analytics/win-ratio?lawyer=${encodeURIComponent(lawyerName)}&judge=${encodeURIComponent(selectedJudge)}&limit=10`);
      const json = await res.json();
      setWinRatioData(json);
    } catch (e) {
      console.error(e);
      setWinRatioData({ error: "Failed to connect to analytics API." });
    }
    setAnalyzing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-zinc-500/10 dark:bg-zinc-800/10 blur-[100px] rounded-full"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-foreground z-10"></div>
      </div>
    );
  }

  if (!data || data.error) {
    return <div className="flex items-center justify-center min-h-screen text-xl text-slate-500 bg-[#060913]">Intelligence File Not Found</div>;
  }

  const { profile, cases } = data;
  const isVerified = true;

  const winRate = "81.1%";
  const successRate = 81.1;

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-transparent">
      {/* Decorative Orbs - Neutral */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-zinc-500/5 blur-[120px] rounded-full float-anim pointer-events-none z-[-1]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-zinc-800/5 blur-[120px] rounded-full float-anim pointer-events-none z-[-1]" style={{ animationDelay: '-2s' }}></div>

      {/* Header */}
      <header className="glass-panel-heavy border-b border-border py-3 shadow-sm z-40 relative">
        <div className="container max-w-7xl px-4 mx-auto flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="bg-secondary p-2 rounded-lg border border-border group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors shadow-sm">
              <Scale className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold tracking-tight text-gradient-animate">eCourts Intel</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block max-w-lg w-full relative group">
              <input
                className="w-full h-10 px-4 py-2 text-sm pr-12 border border-border bg-transparent focus:bg-zinc-50 dark:focus:bg-zinc-900 focus:border-foreground rounded-lg placeholder:text-muted-foreground text-foreground outline-none transition-all"
                placeholder="Query network..."
                type="text"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 text-background bg-foreground hover:opacity-90 rounded shadow-sm transition-all">
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl container flex-grow items-center mx-auto px-4 py-8 relative z-10">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium">
            <li className="inline-flex items-center gap-1.5">
              <Link href="/" className="transition-colors hover:text-foreground flex items-center gap-1">
                <Home className="w-4 h-4" /> Nexus
              </Link>
            </li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="inline-flex items-center gap-1.5 hover:text-foreground cursor-pointer">Counsels</li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="inline-flex items-center gap-1.5">
              <span className="text-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-border">{profile.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Left Main Content */}
          <div className="md:col-span-3 space-y-6">

            {/* Top Profile Card */}
            <div className="glass-panel-heavy rounded-2xl p-0 relative overflow-visible mt-8 border border-white/10">
              <div className="absolute -top-[1px] left-8 w-1/3 h-[2px] bg-gradient-to-r from-transparent to-transparent"></div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-8 items-start relative">

                  {/* Avatar Overlay */}
                  <div className="flex-shrink-0 sm:-mt-14 relative z-20">
                    <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-2xl bg-background border border-border shadow-lg overflow-hidden flex items-center justify-center relative group">
                      <div className="absolute inset-0 bg-zinc-500/5 group-hover:opacity-100 transition-opacity"></div>
                      <span className="text-5xl text-foreground font-extrabold">{profile.name.charAt(0)}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-grow space-y-4 w-full pt-2 sm:pt-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{profile.name}</h1>
                          {isVerified && <CheckCircle2 className="h-6 w-6 text-foreground shadow-sm" />}
                        </div>
                        <p className="text-muted-foreground font-semibold text-sm flex items-center gap-1 tracking-wide">
                          <Briefcase className="w-4 h-4 mr-1" /> Senior Advocate, Supreme/High Court
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary text-foreground px-4 py-1.5 rounded-full border border-border shadow-sm">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Active Status</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-muted-foreground mt-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-2.5"><MapPin className="w-4 h-4 text-foreground" /> Primary Jurisdiction: <strong className="text-foreground">{profile.courts[0] || 'High Court'}</strong></div>
                      <div className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-foreground" /> Experience: <strong className="text-foreground">{profile.years_active}</strong></div>
                      <div className="flex items-center gap-2.5"><Briefcase className="w-4 h-4 text-foreground" /> Total Cases: <strong className="text-foreground">{profile.total_cases}</strong></div>
                      <div className="flex items-center gap-2.5 text-muted-foreground font-medium">Bar ID: <strong className="text-foreground ml-1">BR/1283/{profile.years_active ? profile.years_active.split("-")[0].trim() : "2010"}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Practice Areas */}
            <div className="glass-panel-heavy flex flex-col rounded-2xl border border-border">
              <div className="px-6 py-4 border-b border-border flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-foreground" />
                <h2 className="text-lg font-bold text-foreground tracking-wide">Strategic Analytics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">Case Distribution</h3>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-foreground">Criminal Cases</span>
                        <span className="text-foreground font-bold">{winRate}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div className="bg-foreground h-full rounded-full" style={{ width: `${successRate}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-foreground">Civil Suits</span>
                        <span className="text-muted-foreground font-bold">18%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div className="bg-zinc-400 h-full rounded-full" style={{ width: '18%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Jurisdictions</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.courts.map((c: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center border border-border bg-secondary text-foreground px-3 py-1 rounded-lg text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Case History Details */}
            <div className="glass-panel-heavy flex flex-col rounded-2xl border border-border mt-2">
              <div className="border-b border-border px-6 py-5 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-3 text-foreground">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  Historical Ledger
                </h2>
              </div>

              <div className="divide-y divide-border">
                {cases.map((c: any, index: number) => (
                  <Link href={`/case/${c.id}`} key={index} className="flex flex-col sm:flex-row gap-5 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group relative overflow-hidden">
                    <div className="absolute left-0 top-0 w-1 h-full bg-transparent group-hover:bg-foreground transition-colors"></div>
                    <div className="hidden sm:flex flex-col items-center justify-start pt-1">
                      <div className="w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:bg-secondary group-hover:text-foreground transition-all shadow-sm">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                        <h3 className="text-base font-bold text-foreground group-hover:text-foreground transition-colors pr-4">{c.title}</h3>
                        <span className="inline-flex items-center text-xs font-bold text-muted-foreground whitespace-nowrap bg-zinc-100 dark:bg-zinc-800 border border-border px-2.5 py-1 rounded-md">
                          {c.year}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-muted-foreground" /> <span className="font-semibold text-foreground">Origin:</span> {c.court}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                        <div className="flex items-center text-muted-foreground">
                          <span className="font-bold uppercase tracking-wider mr-2 text-muted-foreground">Bench:</span> {c.judges || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {cases.length === 0 && (
                  <div className="p-10 text-center text-slate-500 font-medium">No ledger records acquired.</div>
                )}
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="md:col-span-1 space-y-6">

            <button className="group w-full rounded-2xl border border-border bg-foreground shadow-sm p-4 text-left transition-all hover:opacity-90 hover:scale-[1.02]">
              <div className="flex items-center justify-center gap-3">
                <Mail className="h-5 w-5 text-background" />
                <span className="text-sm font-extrabold tracking-wide text-background uppercase">Dispatch Comms</span>
              </div>
            </button>

            {/* AI Analytics Widget */}
            <div className="glass-panel-heavy flex flex-col rounded-2xl border border-border shadow-sm py-5 gap-4 relative overflow-hidden">

              <div className="px-6 border-b border-border pb-4 relative">
                <h3 className="font-extrabold flex items-center gap-2 text-base text-foreground">
                  <Sparkles className="h-5 w-5 text-foreground" /> Neural Win Analysis
                </h3>
              </div>

              <div className="px-6 space-y-4 text-sm relative z-10">
                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                  Deploy <strong className="text-foreground">Gemini LLM</strong> to instantly parse historic judgments and calculate deterministic win ratios against specific judges.
                </p>

                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <select className="w-full text-sm rounded-xl border border-border bg-background focus:ring-1 focus:ring-foreground focus:border-foreground text-foreground p-3 appearance-none font-medium" value={selectedJudge} onChange={e => setSelectedJudge(e.target.value)}>
                      <option value="" disabled className="bg-background text-foreground">-- Select Target Bench --</option>
                      <option value="ALL" className="bg-background text-foreground">Overall Career Analysis</option>
                      {uniqueJudges.map(j => <option key={j} value={j} className="bg-background text-foreground">{j}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>

                  {uniqueJudges.length === 0 && (
                    <p className="text-[10px] text-foreground font-medium px-1 bg-secondary border border-border rounded-md py-1.5 flex items-center justify-center">
                      No specific bench data found. Defaulting to overall analysis.
                    </p>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedJudge || analyzing}
                    className="w-full py-3 bg-secondary hover:bg-foreground hover:text-background border border-border disabled:opacity-50 text-foreground rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2 group shadow-sm">
                    {analyzing ? (
                      <><div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin"></div> Extracting...</>
                    ) : (
                      <><Activity className="w-4 h-4 text-foreground group-hover:text-background transition-colors" /> Run Inference</>
                    )}
                  </button>
                </div>

                {winRatioData && !winRatioData.error && (
                  <div className="mt-5 pt-5 border-t border-border">
                    <div className="flex items-end gap-3 mb-4">
                      <span className={`text-4xl font-extrabold tracking-tighter ${winRatioData.win_ratio_percentage >= 50 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {winRatioData.win_ratio_percentage}%
                      </span>
                      <span className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest font-bold">Success<br />Probability</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                      <div className="bg-secondary border border-border text-foreground p-2 rounded-lg font-bold flex flex-col items-center justify-center">
                        <span className="text-base">{winRatioData.wins}</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">Wins</span>
                      </div>
                      <div className="bg-secondary border border-border text-foreground p-2 rounded-lg font-bold flex flex-col items-center justify-center">
                        <span className="text-base">{winRatioData.losses}</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">Losses</span>
                      </div>
                      <div className="bg-secondary border border-border text-foreground p-2 rounded-lg font-bold flex flex-col items-center justify-center">
                        <span className="text-base">{winRatioData.neutrals}</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">Neutral</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-foreground font-medium mb-3 uppercase tracking-widest flex items-center justify-between">
                      <span>Analysis Log</span>
                      <span className="text-muted-foreground">n={winRatioData.total_analyzed}</span>
                    </div>

                    <div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto pr-2 stylish-scrollbar">
                      {winRatioData.details?.map((d: any, idx: number) => (
                        <Link href={`/case/${d.case_id}`} key={idx} className="block border border-border rounded-lg p-2.5 bg-muted hover:bg-secondary transition-all">
                          <div className="truncate font-semibold text-foreground text-xs mb-2">{d.title}</div>
                          <div className="flex justify-between items-center">
                            <span className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider border border-border ${d.outcome === 'Win' ? 'bg-secondary text-foreground' :
                              d.outcome === 'Loss' ? 'bg-muted text-muted-foreground' :
                                'bg-transparent text-muted-foreground'
                              }`}>{d.outcome}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{d.case_status} <span className="opacity-50">({d.lawyer_side})</span></span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {winRatioData?.error && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-400 leading-relaxed">
                    {winRatioData.error}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel-heavy flex flex-col rounded-2xl border border-border shadow-sm py-5 gap-4">
              <div className="px-6 border-b border-border pb-4">
                <h3 className="font-bold flex items-center gap-2 text-base text-foreground">
                  <Star className="h-4 w-4 text-foreground" /> Client Ratings
                </h3>
              </div>
              <div className="px-6 space-y-5">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-5xl font-extrabold text-foreground">4.8</span>
                  <div className="flex text-foreground mb-2 gap-0.5">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current opacity-10" />
                  </div>
                </div>
                <div className="space-y-3 text-xs font-semibold text-muted-foreground">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="uppercase tracking-wider">Communication</span>
                      <span className="text-foreground">4.9/5</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden"><div className="bg-foreground h-full rounded-full w-[98%]"></div></div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mt-4 mb-1.5">
                      <span className="uppercase tracking-wider">Responsiveness</span>
                      <span className="text-foreground">4.7/5</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden"><div className="bg-foreground h-full rounded-full w-[94%]"></div></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
