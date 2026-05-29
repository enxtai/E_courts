"use client";

import React, { useState, useEffect } from 'react';
import { Search, FileText, User, Users, Scale, Download, Calendar, MapPin, Briefcase, Eye, Home, ChevronRight, Settings2, Sparkles, Activity } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type TabType = 'lawyers' | 'litigants' | 'judges' | 'orders';

const CASE_TYPES = [
  { label: "Criminal Complaint Case", count: 91789270 },
  { label: "Bail Application", count: 13395693 },
  { label: "Civil Suit", count: 10942860 },
  { label: "Writ Petition (Civil)", count: 9893297 },
  { label: "Criminal Miscellaneous", count: 7503342 },
  { label: "Original Suit", count: 6412021 },
  { label: "Company Petition", count: 5807433 },
  { label: "Sessions Trial", count: 4925978 },
  { label: "First Appeal", count: 2052911 }
];

export default function eCourtsPortal() {
  const [activeTab, setActiveTab] = useState<TabType>('lawyers');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResults([]);
    try {
      const response = await fetch(`${API_BASE}/${activeTab}?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [activeTab]);

  const TabButton = ({ type, icon: Icon, label }: { type: TabType, icon: any, label: string }) => (
    <button
      className={`relative flex-1 py-4 flex flex-col items-center justify-center gap-2 font-semibold text-sm sm:text-base transition-all duration-300 z-10 ${
        activeTab === type 
          ? 'text-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors'
      }`}
      onClick={() => { setActiveTab(type); setQuery(''); }}
      type="button"
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === type ? 'scale-110' : ''}`} />
      {label}
      {activeTab === type && (
        <div className="absolute inset-0 bg-secondary rounded-xl border border-border -z-10 shadow-sm"></div>
      )}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Decorative Orbs - Subtly neutral */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-secondary/10 dark:bg-secondary/10 blur-[120px] rounded-full float-anim pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 dark:bg-secondary/5 blur-[120px] rounded-full float-anim pointer-events-none" style={{animationDelay: '-3s'}}></div>

      <main className="max-w-full !py-4 lg:py-10 w-full relative z-10">
        <div className="px-4 md:px-0 py-2">
          <div className="mx-auto max-w-7xl md:px-8">
            
            {/* Massive Hero Block */}
            <div className="mb-10 text-center flex flex-col items-center mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-foreground text-xs font-semibold tracking-wide uppercase mb-6">
                <Sparkles className="w-4 h-4" /> Next-Gen Legal Analytics
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-4">
                <Scale className="w-12 h-12 md:w-16 md:h-16 text-foreground" /> 
                <span className="text-gradient-animate">eCourts Intelligence</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
                An advanced directory and predictive analytics engine. Search across millions of legal outcomes, analyze win ratios, and discover unparalleled insights.
              </p>
            </div>

            {/* Central Search Console */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="glass-panel rounded-2xl p-2 md:p-3 relative">
                <div className="relative z-10 bg-background rounded-xl overflow-hidden">
                  <nav className="flex items-center p-2 gap-2 border-b border-border">
                    <TabButton type="lawyers" icon={Briefcase} label="Lawyers" />
                    <TabButton type="litigants" icon={Users} label="Litigants" />
                    <TabButton type="judges" icon={User} label="Judges" />
                    <TabButton type="orders" icon={FileText} label="Orders" />
                  </nav>
                  
                  <form onSubmit={handleSearch} className="relative p-3">
                    <div className="relative flex items-center group">
                      <Search className="absolute left-4 w-6 h-6 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                      <input
                        type="text"
                        className="w-full pl-14 pr-32 py-5 rounded-xl border border-border bg-transparent focus:bg-zinc-50 dark:focus:bg-zinc-900 focus:border-foreground outline-none transition-all text-foreground text-lg placeholder:text-muted-foreground"
                        placeholder={`Search intelligent records for ${activeTab}...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        className="absolute right-3 top-2.5 bottom-2.5 px-6 bg-foreground text-background hover:opacity-90 rounded-lg font-bold tracking-wide flex items-center justify-center transition-all shadow-sm hover:scale-[1.02]"
                      >
                        ANALYZE
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Main 2-column container */}
        <div className="max-w-7xl container flex-grow items-start mx-auto px-4 md:px-8 mt-4">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
             
             {/* LEFT SIDEBAR */}
             <div className="lg:col-span-1 order-2 lg:order-1 hidden lg:block">
               <div className="lg:sticky lg:top-8">
                 <div className="glass-panel rounded-2xl w-full py-4 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-foreground"></div>
                    <div className="px-5 pb-4 pt-2 border-b border-border flex items-center justify-between">
                       <h2 className="font-bold text-base flex items-center gap-2 text-foreground">
                         <Activity className="w-5 h-5 text-muted-foreground" /> Deep Filters
                       </h2>
                       <button className="text-muted-foreground hover:text-foreground transition-colors bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-lg">
                         <Settings2 className="w-4 h-4" />
                       </button>
                    </div>
                    
                    <div className="flex-1 px-5 py-5 space-y-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-border bg-transparent focus:outline-none focus:border-foreground transition-all text-foreground placeholder:text-muted-foreground"
                          placeholder="Filter criteria..."
                          type="text"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
                           Case Types
                        </h4>
                        <div className="flex flex-col gap-2">
                          {CASE_TYPES.map((ct) => (
                             <div key={ct.label} className="cursor-pointer group flex items-center justify-between rounded-lg border border-border bg-transparent p-2 px-3 hover:bg-secondary transition-all">
                                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground truncate">{ct.label}</span>
                                <span className="ml-2 bg-muted text-foreground border border-border rounded px-2 py-0.5 text-[10px] font-bold">
                                  {ct.count > 1000000 ? (ct.count / 1000000).toFixed(1) + 'M' : Math.floor(ct.count / 1000) + 'K'}
                                </span>
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
             </div>
             
             {/* RIGHT CONTENT COLUMN */}
             <div className="lg:col-span-3 order-1 lg:order-2">
                <div>
                  {!loading && results.length > 0 && (
                    <div className="text-sm border-b border-border pb-4 font-medium text-muted-foreground mb-6 flex items-center justify-between">
                       <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-foreground glow-pulse"></span> {results.length} neural matches extracted</span>
                       <span className="text-xs font-semibold bg-secondary px-3 py-1 rounded-full border border-border text-foreground">Sorted by AI Relevance</span>
                    </div>
                  )}
                  
                  <div className="grid gap-5">
                    {results.map((res: any, idx) => (
                      <div key={idx} className="glass-panel-heavy p-6 rounded-2xl result-card relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-foreground opacity-20 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pl-2">
                          <div className="flex-1">
                             <h3 className="text-xl font-bold mb-2 text-foreground flex items-center gap-3">
                               {activeTab === 'lawyers' ? (res.lawyers ? res.lawyers.split(',')[0].trim() : res.title) :
                                activeTab === 'judges' ? (res.judges ? res.judges.split(',')[0].trim() : res.title) :
                                activeTab === 'litigants' ? (query ? ((res.litigant_petitioner && res.litigant_petitioner.toLowerCase().includes(query.toLowerCase())) ? res.litigant_petitioner : res.litigant_respondent || res.litigant_petitioner) : res.litigant_petitioner || res.title) :
                                (res.title || 'Unknown Case')}
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">Verified</span>
                             </h3>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2 bg-muted p-2 rounded-lg border border-border"><MapPin className="w-4 h-4 text-foreground"/> <span className="font-semibold text-foreground">Court:</span> {res.court}</div>
                                <div className="flex items-center gap-2 bg-muted p-2 rounded-lg border border-border"><Calendar className="w-4 h-4 text-foreground"/> <span className="font-semibold text-foreground">Year:</span> {res.year}</div>
                                
                                {activeTab !== 'orders' && (
                                   <div className="col-span-1 md:col-span-2 flex items-start gap-2 bg-muted p-3 rounded-lg border border-border">
                                      <FileText className="w-4 h-4 mt-0.5 text-foreground shrink-0"/> 
                                      <span className="line-clamp-2 leading-relaxed"><span className="font-semibold text-foreground">Case Origin:</span> {res.title || 'N/A'}</span>
                                   </div>
                                )}
                                
                                {activeTab === 'orders' && (
                                   <>
                                     {res.judges && <div className="col-span-1 md:col-span-2 flex items-start gap-2 bg-muted p-3 rounded-lg border border-border"><User className="w-4 h-4 mt-0.5 text-foreground shrink-0"/> <span className="line-clamp-2"><span className="font-semibold text-foreground">Bench:</span> {res.judges}</span></div>}
                                     {res.lawyers && <div className="col-span-1 md:col-span-2 flex items-start gap-2 bg-muted p-3 rounded-lg border border-border"><Briefcase className="w-4 h-4 mt-0.5 text-foreground shrink-0"/> <span className="line-clamp-2"><span className="font-semibold text-foreground">Counsels:</span> {res.lawyers}</span></div>}
                                   </>
                                )}
                             </div>
                          </div>
                          
                          <div className="md:w-auto w-full self-start mt-2 md:mt-0 flex flex-col gap-3">
                              {activeTab === 'lawyers' && (
                                <Link href={`/lawyer/${encodeURIComponent(query || (res.lawyers ? res.lawyers.split(',')[0].trim() : 'Unknown'))}`} className="w-full">
                                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-foreground hover:text-background text-foreground rounded-xl text-sm font-bold transition-all border border-border">
                                    <Activity className="w-4 h-4" /> AI Analytics
                                  </button>
                                </Link>
                              )}
                              {activeTab === 'litigants' && (
                                <Link href={`/litigant/${encodeURIComponent(query || res.litigant_petitioner || 'Unknown')}`} className="w-full">
                                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-foreground hover:text-background text-foreground rounded-xl text-sm font-bold transition-all border border-border">
                                    <Eye className="w-4 h-4" /> View Entities
                                  </button>
                                </Link>
                              )}
                              {activeTab === 'judges' && (
                                <Link href={`/judge/${encodeURIComponent(query || (res.judges ? res.judges.split(',')[0].trim() : 'Unknown'))}`} className="w-full">
                                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-foreground hover:text-background text-foreground rounded-xl text-sm font-bold transition-all border border-border">
                                    <Eye className="w-4 h-4" /> View Bench
                                  </button>
                                </Link>
                              )}
                              {activeTab === 'orders' && (
                                <Link href={`/case/${res.id}`} className="w-full">
                                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-foreground hover:text-background text-foreground rounded-xl text-sm font-bold transition-all border border-border">
                                    <FileText className="w-4 h-4" /> Read Order
                                  </button>
                                </Link>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {!loading && results.length === 0 && query && (
                      <div className="text-center py-20 text-slate-400 glass-panel-heavy rounded-2xl">
                        <Search className="w-16 h-16 mx-auto mb-4 text-indigo-500/50" />
                        <h3 className="text-xl font-bold text-white mb-2">No intelligence found</h3>
                        <p>Our models couldn't find matches for "{query}". Try altering your parameters.</p>
                      </div>
                    )}

                    {loading && (
                       <div className="py-20 flex flex-col items-center justify-center glass-panel-heavy rounded-2xl gap-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-foreground"></div>
                          <p className="text-sm font-bold text-foreground tracking-widest uppercase animate-pulse">Running Neural Search...</p>
                       </div>
                    )}
                  </div>
                </div>
             </div>
             
          </div>
        </div>
      </main>
    </div>
  );
}
