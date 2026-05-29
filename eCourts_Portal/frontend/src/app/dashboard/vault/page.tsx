"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Search, UploadCloud, FileText, CheckCircle2, TerminalSquare, Server, Eye, Loader2, X
} from 'lucide-react';
import { auth } from '@/lib/firebase';

interface DocumentMetadata {
  id: number;
  title: string;
  status: string;
}

export default function DocumentVault() {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [ragFiles, setRagFiles] = useState<File[]>([]);
  const [isRagRunning, setIsRagRunning] = useState(false);
  const [ragProgress, setRagProgress] = useState({ status: '', percent: 0 });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchDocuments(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);



  const fetchDocuments = async (uid: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${API_BASE}/vault-documents/${uid}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );



  const handleRagUpload = async () => {
    if (ragFiles.length === 0) return;
    setIsRagRunning(true);
    setRagProgress({ status: 'Initializing...', percent: 2 });

    const formData = new FormData();
    ragFiles.forEach(f => formData.append("files", f));
    
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to upload documents.");
      setIsRagRunning(false);
      return;
    }
    formData.append("user_id", user.uid);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${API_BASE}/admin/rag-ingest`, {
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
               if (json.success) {
                 setRagProgress({ status: 'Ingestion Complete!', percent: 100 });
                 if (auth.currentUser) fetchDocuments(auth.currentUser.uid);
                 setTimeout(() => {
                   setShowUploadModal(false);
                   setIsRagRunning(false);
                   setRagFiles([]);
                 }, 2000);
               } else {
                 alert("Error: " + json.error);
               }
            } else if (dataStr.startsWith("[OLLAMA] ")) {
               const msg = dataStr.slice(9);
               if (msg.includes("chunks | ")) {
                  const percentMatch = msg.match(/\| ([\d.]+)%\]/);
                  if (percentMatch) {
                     setRagProgress({ status: 'Generating Embeddings...', percent: Math.max(15, parseFloat(percentMatch[1])) });
                  }
               } else if (msg.includes("Splitting into chunks")) {
                  setRagProgress({ status: 'Splitting Documents...', percent: 15 });
               } else if (msg.includes("Loaded")) {
                  setRagProgress({ status: 'Reading PDFs...', percent: 10 });
               }
            } else if (dataStr.includes("Saved")) {
               setRagProgress({ status: 'Uploading files...', percent: 5 });
            }
          }
        }
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
      setIsRagRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/10 relative">
      
      {/* Header */}
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" /> Document Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and search your ingested legal database.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg bg-card text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <UploadCloud className="w-4 h-4" /> Upload New
          </button>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-grow p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No documents found</h3>
            <p className="text-sm text-muted-foreground mt-1">Upload a PDF to get started or try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col h-full items-start">
                <div className="bg-indigo-500/10 p-3 rounded-full mb-4">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="font-semibold text-foreground leading-snug mb-2 break-all line-clamp-2" title={doc.title}>
                  {doc.title}
                </h3>
                <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-medium text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  {doc.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal overlay */}
      {showUploadModal && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2"><UploadCloud className="w-5 h-5 text-indigo-500"/> Upload to Vault</h2>
              <button onClick={() => !isRagRunning && setShowUploadModal(false)} disabled={isRagRunning} className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-50">
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className={`border-2 border-dashed transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center relative min-h-[200px] ${isRagRunning ? 'border-border bg-muted/20 opacity-70' : 'border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-500/5 cursor-pointer'}`}>
                {!isRagRunning && (
                  <input 
                    type="file" 
                    accept=".pdf" 
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setRagFiles(files);
                    }} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                )}
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                  <Database className={`h-8 w-8 ${isRagRunning ? 'text-muted-foreground' : 'text-indigo-500'}`} />
                </div>
                <div className="font-semibold text-base mb-1">
                  {ragFiles.length > 0 ? (
                    <div className="flex flex-col gap-1 items-center z-20 relative">
                      <span className="text-indigo-600 font-bold">{ragFiles.length} files selected</span>
                      <div className="flex flex-wrap justify-center gap-2 mt-2">
                        {ragFiles.slice(0, 3).map((f, i) => (
                          <span key={i} className="text-xs bg-background border border-border text-muted-foreground px-2 py-1 rounded-md max-w-[150px] truncate shadow-sm">
                            {f.name}
                          </span>
                        ))}
                        {ragFiles.length > 3 && (
                          <span className="text-xs bg-indigo-500/10 text-indigo-600 font-medium px-2 py-1 rounded-md">
                            +{ragFiles.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ) : "Select Multiple PDFs"}
                </div>
                {!ragFiles.length && <p className="text-muted-foreground text-sm mt-2">Upload PDFs to your private RAG vector store.</p>}
              </div>

              {isRagRunning ? (
                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">{ragProgress.status}</span>
                    <span className="text-sm font-bold text-indigo-600">{ragProgress.percent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out relative"
                      style={{ width: `${ragProgress.percent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRagUpload}
                  disabled={ragFiles.length === 0}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-white font-medium transition-all shadow-sm ${
                    ragFiles.length === 0 ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                  }`}
                >
                  Run Embedding
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
