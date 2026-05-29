"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Scale, Home, ChevronRight, UploadCloud, FileText, CheckCircle2,
  TerminalSquare, Server
} from 'lucide-react';
import Link from 'next/link';

export default function AdminUploadPanel() {
  // Vision State
  const [visionFiles, setVisionFiles] = useState<File[]>([]);
  const [visionLogs, setVisionLogs] = useState<string[]>([]);
  const [isVisionRunning, setIsVisionRunning] = useState(false);
  const [visionData, setVisionData] = useState<any[]>([]);

  const visionLogEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visionLogEndRef.current) {
      visionLogEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visionLogs]);

  const handleVisionUpload = async () => {
    if (visionFiles.length === 0) return;
    setIsVisionRunning(true);
    setVisionLogs([]);
    setVisionData([]);

    const formData = new FormData();
    visionFiles.forEach(f => formData.append("files", f));

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${API_BASE}/admin/vision-ingest`, {
        method: "POST",
        body: formData,
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n\n')) >= 0) {
          const event = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 2);

          if (event.startsWith("data: ")) {
            const dataStr = event.slice(6);
            if (dataStr.startsWith("[RESULT] ")) {
              const json = JSON.parse(dataStr.slice(9));
              if (json.success) setVisionData(json.data);
              else setVisionLogs(prev => [...prev, "[ERROR] " + json.error]);
            } else {
              setVisionLogs(prev => [...prev, dataStr]);
            }
          }
        }
      }
    } catch (err: any) {
      setVisionLogs(prev => [...prev, "[ERROR] " + err.message]);
    } finally {
      setIsVisionRunning(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <header className="govt-header py-3 outline-none">
        <div className="container max-w-7xl px-4 mx-auto flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors border border-border">
              <Scale className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold tracking-tight text-foreground">eCourtsIndia Admin</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        <nav aria-label="breadcrumb" className="mb-6 hidden">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:gap-2.5">
            <li className="inline-flex items-center gap-1.5">
              <Link href="/" className="hover:text-foreground flex items-center gap-1">
                <Home className="w-4 h-4" />Home
              </Link>
            </li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li><span className="font-normal text-foreground">Ingestion Consoles</span></li>
          </ol>
        </nav>

        {/* Left Side: Upload Dropzone */}
        <div className="lg:w-1/3 flex flex-col gap-6">
          <div className="bg-card rounded-xl border shadow-sm p-6 flex flex-col relative shrink-0">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" /> Upload PDFs
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Extract metadata into SQLite via Gemini.
            </p>
            <div className="flex-grow border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center bg-primary/5 cursor-pointer relative">
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setVisionFiles(files);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isVisionRunning}
              />
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="font-semibold text-base mb-1">
                {visionFiles.length > 0 ? (
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-primary font-bold">{visionFiles.length} files selected</span>
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {visionFiles.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-xs bg-background border text-muted-foreground px-2 py-1 rounded-md max-w-[150px] truncate shadow-sm">
                          {f.name}
                        </span>
                      ))}
                      {visionFiles.length > 3 && (
                        <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-1 rounded-md">
                          +{visionFiles.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : "Select Multiple PDFs"}
              </div>
              <p className="text-muted-foreground text-sm max-w-[200px] mt-2">
                Drag and drop files to start the batch extraction
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={handleVisionUpload}
                disabled={visionFiles.length === 0 || isVisionRunning}
                className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-white font-medium transition-all ${visionFiles.length === 0 || isVisionRunning ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-sm'
                  }`}
              >
                {isVisionRunning ? <span className="animate-pulse">Processing Batch...</span> : "Run Extraction"}
              </button>
            </div>
          </div>

          {/* Vision Extracted Data Preview Card */}
          {visionData.length > 0 && (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[40vh] pr-2 scrollbar-thin">
              {visionData.map((data, idx) => (
                <div key={idx} className="bg-card shrink-0 rounded-xl border border-green-500/50 shadow-sm shadow-green-500/10 p-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <h3 className="text-sm font-semibold text-green-700">File {idx + 1} Extracted</h3>
                  </div>
                  <p className="text-xs font-medium text-foreground mb-1 truncate">{data.title}</p>
                  <p className="text-xs text-muted-foreground truncate mb-2">{data.court}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {data.extracted_text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Live Terminal */}
        <div className="lg:w-2/3 h-[50vh] lg:h-full rounded-xl bg-[#0d1117] border border-gray-800 flex flex-col shadow-2xl overflow-hidden relative font-mono">
          {/* Terminal Header */}
          <div className="bg-[#161b22] px-4 py-2 border-b border-gray-800 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-2 ml-2">
              <TerminalSquare className="w-3.5 h-3.5" />
              root@vision-ocr:~#
            </span>
            {isVisionRunning && (
              <span className="ml-auto flex items-center gap-2 text-xs text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Streaming live
              </span>
            )}
          </div>

          {/* Terminal Output */}
          <div className="p-4 flex-grow overflow-y-auto text-sm leading-relaxed tracking-tight text-gray-300">
            {visionLogs.length === 0 ? (
              <div className="text-gray-600 flex items-center gap-2 h-full justify-center">
                <Server className="w-4 h-4" /> Waiting for Vision batch job...
              </div>
            ) : (
              visionLogs.map((log, i) => (
                <div key={i} className="mb-1">
                  <span className="text-indigo-400 mr-2">❯</span>
                  <span className={
                    log.includes('[ERROR]') ? 'text-red-400' :
                      log.includes('[RESULT]') ? 'text-green-400' :
                        log.includes('[PyMuPDF]') ? 'text-yellow-300' :
                          log.includes('[GEMINI]') ? 'text-purple-400' :
                            'text-gray-300'
                  }>{log}</span>
                </div>
              ))
            )}
            <div ref={visionLogEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
