"use client";

import React, { useEffect, useState, use } from 'react';
import {
  Scale, Search, Home, ChevronRight, Briefcase, MapPin, Calendar,
  Trophy, Activity, Star, CheckCircle2, ChevronDown, Gavel,
  ShieldCheck, Mail, Clock, FileText, User, Users
} from 'lucide-react';
import Link from 'next/link';

export default function LitigantProfile({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const litigantName = decodeURIComponent(name);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    fetch(`${API_BASE}/litigant/${encodeURIComponent(litigantName)}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [litigantName]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div></div>;
  }

  if (!data || data.error) {
    return <div className="flex items-center justify-center min-h-screen text-xl text-muted-foreground">Litigant Not Found</div>;
  }

  const { profile, cases } = data;

  // Compute case types dynamically from titles
  const caseTypeCounts: Record<string, number> = {};
  cases.forEach((c: any) => {
    let type = "Sessions Trial";
    if (c.title.toLowerCase().includes("bail")) type = "Bail Application";
    if (c.title.toLowerCase().includes("misc")) type = "Criminal Miscellaneous";

    caseTypeCounts[type] = (caseTypeCounts[type] || 0) + 1;
  });

  const sortedTypes = Object.keys(caseTypeCounts).sort((a, b) => caseTypeCounts[b] - caseTypeCounts[a]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="govt-header py-3 outline-none">
        <div className="container max-w-7xl px-4 mx-auto flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="bg-secondary p-2 rounded-lg group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors border border-border">
              <Scale className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold tracking-tight text-foreground">eCourtsIndia</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block max-w-lg w-full">
              <div className="relative w-full">
                <input
                  className="w-full h-10 px-3 py-2 text-sm pr-20 border-2 border-primary/20 focus:border-primary bg-background text-foreground shadow-sm rounded-lg placeholder:text-muted-foreground"
                  placeholder="Search eCourts..."
                  type="text"
                />
                <div className="absolute top-1/2 right-1 -translate-y-1/2">
                  <button className="inline-flex items-center justify-center p-2 text-primary-foreground bg-primary hover:bg-primary/90 shadow-sm rounded-md">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Sign In</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl container flex-grow mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
            <li className="inline-flex items-center gap-1.5">
              <Link href="/" className="transition-colors hover:text-foreground flex items-center gap-1">
                <Home className="w-4 h-4" />Home
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="inline-flex items-center gap-1.5">Litigants</li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="inline-flex items-center gap-1.5">
              <span className="font-normal text-foreground">{profile.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Left Sidebar (Filters/Case Types) */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm py-4 gap-4">
              <div className="px-4 border-b border-border pb-2 flex items-center h-8 justify-between">
                <h2 className="font-semibold text-base">Case Types</h2>
              </div>
              <div className="px-4 space-y-3 pb-2 max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {sortedTypes.map((type, idx) => {
                  const count = caseTypeCounts[type];
                  const percent = (count / profile.total_cases) * 100;
                  return (
                    <div key={idx} className="group relative overflow-hidden rounded-md border border-border bg-background p-1 px-2 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex justify-between items-center h-10 w-full text-xs">
                      {/* Progress Bar Background */}
                      <div className="absolute inset-0 bg-secondary group-hover:opacity-100 transition-opacity" style={{ width: `${percent}%` }}></div>

                      <div className="relative z-10 flex w-full justify-between items-center gap-2">
                        <span className="truncate font-medium text-foreground">{type}</span>
                        <span className="bg-foreground text-background rounded-sm px-1.5 py-0.5 font-bold text-[10px]">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm py-4 gap-4">
              <div className="px-4 border-b border-border pb-2 flex items-center h-8 justify-between">
                <h2 className="font-semibold text-base">Years Active</h2>
              </div>
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center border border-border bg-secondary text-foreground px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {profile.years_active}
                </span>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="md:col-span-3 space-y-4">

            {/* Search Top Bar */}
            <div className="w-full">
              <form className="relative">
                <div className="relative">
                  <input
                    className="flex w-full min-w-0 rounded-md outline-none focus-visible:ring-[3px] focus-visible:border-primary focus-visible:ring-primary/20 h-12 text-base pl-5 pr-12 border-2 border-border bg-card text-foreground shadow-sm placeholder:text-muted-foreground/70"
                    placeholder="Search litigant by name"
                    type="text"
                    defaultValue={profile.name}
                  />
                  <button className="justify-center rounded-md text-sm font-medium shadow-sm py-2 absolute right-1 top-1/2 -translate-y-1/2 h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 aspect-square" type="button">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            <h1 className="mb-2 text-3xl font-bold flex items-center gap-3 tracking-tight text-foreground">
              <User className="h-8 w-8 text-primary" />
              {profile.name}
            </h1>

            <p className="text-muted-foreground flex items-center gap-2 mb-6">
              <Briefcase className="w-4 h-4" /> Total Record Count: <span className="font-bold text-foreground">{profile.total_cases}</span> cases
            </p>

            {/* List of Cases */}
            <div className="bg-card flex flex-col rounded-xl border shadow-sm pb-4">
              <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-primary" />
                  Legal Proceedings
                </h2>
              </div>

              <div className="divide-y divide-border">
                {cases.map((c: any, index: number) => (
                  <div key={index} className="flex flex-col gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group px-6">
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                        <Link href={`/case/${c.id}`} className="text-lg font-bold text-foreground hover:underline underline-offset-4 truncate block w-full max-w-3xl">
                          {c.title}
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm text-muted-foreground mt-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground/70" /> Court: <span className="font-medium text-foreground">{c.court}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground/70" /> Year: <span className="font-medium text-foreground">{c.year}</span>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <Gavel className="w-4 h-4 text-muted-foreground/70" /> Judges: <span className="text-foreground">{c.judges || "Not specified"}</span>
                        </div>
                        <div className="flex items-start gap-2 md:col-span-2 bg-muted p-3 rounded-lg border border-border">
                          <Users className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-1 w-full">
                            <div className="text-foreground"><span className="font-semibold text-muted-foreground">Petitioner:</span> {c.litigant_petitioner || "Unknown"}</div>
                            <div className="text-foreground"><span className="font-semibold text-muted-foreground">Respondent:</span> {c.litigant_respondent || "Unknown"}</div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
