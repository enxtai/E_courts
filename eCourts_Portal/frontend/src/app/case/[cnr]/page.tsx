"use client";

import React, { useEffect, useState, use } from 'react';
import {
  Scale, Search, Home, ChevronRight, Gavel, FileText, Clock, Split,
  Users, Briefcase, BookOpen, Bell, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function CaseProfile({ params }: { params: Promise<{ cnr: string }> }) {
  const { cnr } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We treat 'cnr' as our case id mapped from rowid, as our DB doesn't have real CNRs.
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    fetch(`${API_BASE}/case/${cnr}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [cnr]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div></div>;
  }

  if (!data || data.error) {
    return <div className="flex items-center justify-center min-h-screen text-xl text-muted-foreground">Case Not Found</div>;
  }

  // Construct dynamic data from our single case row
  const title = data.title || "Unknown Case Title";
  const caseType = data.title.toLowerCase().includes('bail') ? "Bail Application" : "Sessions Trial";
  const year = data.year || new Date().getFullYear();
  const court = data.court || "Unknown Court";
  const petitioner = data.litigant_petitioner || "Unknown Petitioner";
  const respondent = data.litigant_respondent || "Unknown Respondent";
  const lawyers = data.lawyers ? data.lawyers.split(', ') : [];
  const petAdv = lawyers[0] || "Unknown Adv";
  const resAdv = lawyers[1] || petAdv;
  const cnrStr = `BRPU010080${data.id}${year}`;
  const judges = data.judges || "Hon'ble Special Excise Court No 1";

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
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
                  className="w-full h-10 px-3 py-2 text-sm pr-20 border-2 border-primary/20 focus:border-primary bg-background shadow-sm rounded-lg placeholder:text-muted-foreground text-foreground"
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
      <main className="max-w-7xl container flex-grow items-center mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
            <li className="inline-flex items-center gap-1.5">
              <Link href="/" className="transition-colors hover:text-foreground flex items-center gap-1">
                <Home className="w-4 h-4" />Home
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="inline-flex items-center gap-1.5">Cases</li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="inline-flex items-center gap-1.5">
              <span className="font-normal text-foreground">{cnrStr}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Left Main Content */}
          <div className="md:col-span-3 space-y-4">

            {/* Top Case Title Block (Border-top primary) */}
            <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-0 shadow-sm relative border-t-primary">
              <div className="p-4">
                <div className="space-y-1 flex flex-col gap-1">
                  <div className="flex flex-row gap-1 justify-start items-start">
                    <div className="w-full">
                      <h1 className="text-2xl lg:text-3xl font-sans font-regular text-foreground">{title}</h1>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 flex-wrap sm:gap-x-6 w-full mt-2">
                    <div><span className="text-sm font-medium text-primary">Court:</span><span className="ml-2 text-sm font-light">{court}</span></div>
                    <div><span className="text-sm font-medium text-primary">Judge:</span><span className="ml-2 text-sm font-light">{judges}</span></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 flex-wrap sm:gap-x-6 w-full mt-1">
                    <div><span className="text-sm font-medium text-primary">Case Type:</span><span className="ml-2 text-sm font-light">{caseType}</span></div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 flex-wrap sm:gap-x-6 w-full mt-1">
                    <div><span className="text-sm font-medium text-primary">Reg no:</span><span className="ml-2 text-sm font-light">2385/{year}</span></div>
                    <div><span className="text-sm font-medium text-primary">Filing no:</span><span className="ml-2 text-sm font-light">8081/{year}</span></div>
                    <div><span className="text-sm font-medium text-primary">CNR:</span><span className="ml-2 text-sm font-light">{cnrStr}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parties & Advocates */}
            <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
              <h2 className="text-lg font-sans text-foreground mb-4 flex items-center">
                <Scale className="h-5 w-5 mr-2 text-primary" /> Parties & Advocates
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Petitioner Side */}
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-3">
                    <h3 className="text-sm text-foreground mb-2 flex items-center text-primary">
                      <Users className="h-4 w-4 mr-2" /> Petitioner
                    </h3>
                    <div className="bg-muted/50 rounded-md p-3 flex items-start space-x-2 transition-colors hover:bg-muted">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-primary font-bold">1</span>
                      </div>
                      <div className="flex-1 min-w-0"><span className="text-sm font-light text-foreground">{petitioner}</span></div>
                    </div>
                  </div>
                  <div className="border-l-4 border-border pl-3">
                    <h3 className="text-sm text-foreground mb-2 flex items-center text-primary">
                      <Briefcase className="h-4 w-4 mr-2" /> Petitioner Advocate
                    </h3>
                    <div className="bg-muted/50 rounded-md p-3 flex items-start space-x-2">
                      <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-muted-foreground font-bold">1</span>
                      </div>
                      <div className="flex-1 min-w-0"><span className="text-sm font-light text-foreground">{petAdv}</span></div>
                    </div>
                  </div>
                </div>

                {/* Respondent Side */}
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-3">
                    <h3 className="text-sm text-foreground mb-2 flex items-center text-primary">
                      <Users className="h-4 w-4 mr-2" /> Respondent
                    </h3>
                    <div className="bg-muted/50 rounded-md p-3 flex items-start space-x-2">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-primary font-bold">1</span>
                      </div>
                      <div className="flex-1 min-w-0"><span className="text-sm font-light text-foreground">{respondent}</span></div>
                    </div>
                  </div>
                  <div className="border-l-4 border-border pl-3">
                    <h3 className="text-sm text-foreground mb-2 flex items-center text-primary">
                      <Briefcase className="h-4 w-4 mr-2" /> Respondent Advocate
                    </h3>
                    <div className="bg-muted/50 rounded-md p-3 flex items-start space-x-2">
                      <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-muted-foreground font-bold">1</span>
                      </div>
                      <div className="flex-1 min-w-0"><span className="text-sm font-light text-foreground">{resAdv}</span></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* AI Extracted Summary */}
            {data.extracted_text && (
              <div className="bg-card rounded-lg shadow-sm p-4 border border-border border-l-4 border-l-foreground mt-1">
                <h2 className="text-lg font-sans text-foreground mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-foreground" /> AI Case Summary
                </h2>
                <p className="text-sm font-light text-foreground leading-relaxed">
                  {data.extracted_text}
                </p>
              </div>
            )}

            {/* Case History with Orders (Timeline) */}
            <div className="bg-card rounded-xl border shadow-sm mt-1 py-4">
              <div className="px-4">
                <h2 className="text-xl font-sans font-semibold text-foreground mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-primary" /> Case History with Orders
                </h2>

                <div className="relative max-sm:pr-2 sm:px-4 py-2">
                  {data.history && data.history.length > 0 && (
                    <div className="hidden sm:block absolute left-1/2 top-0 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/20 via-primary/30 to-primary/10 rounded-full z-0"></div>
                  )}
                  <div className="space-y-8 max-sm:pl-2">

                    {data.history && data.history.length > 0 ? (
                      data.history.map((event: any, index: number) => (
                        <div key={index} className="relative z-10">
                          <div className="hidden sm:flex items-start">
                            <div className="text-right w-1/2 pr-8 space-y-3">
                              <div className="bg-card border border-border border-r-4 border-r-primary p-4 rounded-lg shadow-sm ml-auto max-w-md w-full text-left">
                                <p className="text-sm font-medium text-primary">{event.date}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <h4 className="font-medium text-sm text-foreground">{event.title}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              </div>
                            </div>
                            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-card shadow-md border-2 border-primary text-primary">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div className="w-1/2 pl-8 space-y-3"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">No case history available.</p>
                    )}

                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm py-4 gap-4">
              <div className="px-6 border-b border-border pb-4">
                <h3 className="font-semibold flex items-center gap-2 text-base">
                  <Search className="h-4 w-4" /> Similar Case Search
                </h3>
              </div>
              <div className="px-6 space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Users className="h-4 w-4" /> Same Parties</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-secondary rounded-2xl">{petitioner}</span>
                    <span className="px-2 py-1 text-xs bg-secondary rounded-2xl">{respondent}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Scale className="h-4 w-4" /> Lawyers</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-secondary rounded-2xl">{petAdv}</span>
                    <span className="px-2 py-1 text-xs bg-secondary rounded-2xl">{resAdv}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Acts & Sections</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-secondary rounded-2xl">Penal Code 30(A)</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="group w-full rounded-lg border border-border bg-card shadow-sm p-4 text-left transition-all hover:border-primary/30 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">Get Notifications</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">Alerts for any update in this case</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-all group-hover:text-primary" />
              </div>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
