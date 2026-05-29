import React from 'react';
import { Database, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  return (
    <div className="p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome to your Legal AI Workspace. What would you like to do today?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        
        {/* Document Vault Card */}
        <Link href="/dashboard/vault" className="block group">
          <div className="bg-card rounded-2xl border shadow-sm p-6 h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
              Document Vault
            </h2>
            <p className="text-muted-foreground text-sm flex-grow mb-6">
              Upload, organize, and search through all your ingested legal PDFs. Extract structured metadata powered by Gemini Vision.
            </p>
            <div className="flex items-center text-primary text-sm font-medium">
              Open Vault <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Chatbot Card */}
        <Link href="/dashboard/chat" className="block group">
          <div className="bg-card rounded-2xl border shadow-sm p-6 h-full hover:shadow-md hover:indigo-500/50 transition-all cursor-pointer flex flex-col">
            <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-indigo-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-indigo-500 transition-colors">
              AI Chatbot
            </h2>
            <p className="text-muted-foreground text-sm flex-grow mb-6">
              Ask questions and get instant answers from your uploaded knowledge base. Powered by LangChain, ChromaDB, and Ollama embeddings.
            </p>
            <div className="flex items-center text-indigo-500 text-sm font-medium">
              Start Chatting <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
