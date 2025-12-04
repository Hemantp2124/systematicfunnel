import React, { useState, useEffect } from 'react';
import { Document } from '../types';
import { Loader2, Wand2, Send, FileText } from 'lucide-react';
import { refineDocument } from '../api/aiService';

interface DocViewerProps {
  document: Document;
  onUpdate?: (content: string) => void;
}

const DocViewer: React.FC<DocViewerProps> = ({ document, onUpdate }) => {
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [content, setContent] = useState(document.content);

  useEffect(() => {
    setContent(document.content);
  }, [document.content, document.id]);

  useEffect(() => {
    const mermaidElements = window.document.querySelectorAll('.mermaid');
    if (mermaidElements.length > 0 && (window as any).mermaid) {
      setTimeout(() => {
        try {
          (window as any).mermaid.run({ nodes: mermaidElements });
        } catch (e) {
          console.error("Failed to render Mermaid diagrams", e);
        }
      }, 100);
    }
  }, [content]); // Rerun mermaid when content changes

  const handleRefine = async () => {
     if (!refineInstruction.trim()) return;
     
     setIsRefining(true);
     const result = await refineDocument(content, refineInstruction, document.type);
     
     if (result.success && result.content) {
        setContent(result.content);
        if (onUpdate) onUpdate(result.content);
     }
     
     setIsRefining(false);
     setRefineInstruction('');
  };

  const renderMarkdown = (text: string) => {
    // Basic markdown to JSX renderer
    const parseBlock = (block: string) => {
      const lines = block.split('\n');
      const elements = [];
      let listType: 'ul' | 'ol' | null = null;
      let listItems: React.ReactElement[] = [];
  
      const flushList = () => {
        if (listItems.length > 0) {
          if (listType === 'ul') {
            elements.push(<ul key={elements.length} className="list-disc pl-6 my-4 space-y-2 text-textBody">{listItems}</ul>);
          } else if (listType === 'ol') {
            elements.push(<ol key={elements.length} className="list-decimal pl-6 my-4 space-y-2 text-textBody">{listItems}</ol>);
          }
          listItems = [];
          listType = null;
        }
      };
  
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('## ')) {
          flushList();
          elements.push(<h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-textHeading border-b border-border pb-2">{line.substring(3)}</h2>);
        } else if (line.startsWith('### ')) {
          flushList();
          elements.push(<h3 key={i} className="text-xl font-bold mt-6 mb-3 text-textHeading">{line.substring(4)}</h3>);
        } else if (line.startsWith('- ')) {
          if (listType !== 'ul') flushList();
          listType = 'ul';
          listItems.push(<li key={i}>{line.substring(2)}</li>);
        } else if (line.match(/^\d+\.\s/)) {
          if (listType !== 'ol') flushList();
          listType = 'ol';
          listItems.push(<li key={i}>{line.replace(/^\d+\.\s/, '')}</li>);
        } else if (line.trim() === '') {
          flushList();
          elements.push(<br key={i} />);
        } else if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            // This is a simplified table renderer
            flushList();
            const rows = [];
            let currentLine = i;
            while (lines[currentLine] && lines[currentLine].trim().startsWith('|')) {
                rows.push(lines[currentLine].split('|').map(s => s.trim()).slice(1, -1));
                currentLine++;
            }
            i = currentLine - 1;

            if (rows.length > 1) {
                const headers = rows[0];
                const body = rows.slice(2);
                elements.push(
                    <div key={i} className="my-4 overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-border">
                            <thead>
                                <tr>
                                    {headers.map((h, hi) => <th key={hi} className="p-3 border-b border-border bg-surfaceSecondary text-sm font-bold text-textHeading">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {body.map((row, ri) => (
                                    <tr key={ri} className="hover:bg-surfaceSecondary/50">
                                        {row.map((cell, ci) => <td key={ci} className="p-3 border-t border-border text-sm text-textBody">{cell}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
        }
        else {
          flushList();
          if (line.trim()) {
            elements.push(<p key={i} className="my-4 leading-relaxed text-textBody">{line}</p>);
          }
        }
      }
      flushList();
      return elements;
    };

    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeBlock = part.slice(3, -3);
        const [lang, ...codeLines] = codeBlock.split('\n');
        const code = codeLines.join('\n').trim();
        const langTrimmed = lang.trim().toLowerCase();

        if (langTrimmed === 'mermaid') {
          return (
            <div key={index} className="flex justify-center my-6 p-4 bg-surface rounded-card border border-border shadow-subtle">
              <div className="mermaid">{code}</div>
            </div>
          );
        } else {
          return (
            <pre key={index} className="bg-surfaceSecondary border border-border rounded-button p-4 my-6 overflow-x-auto text-sm font-mono text-textHeading">
              <code>{code}</code>
            </pre>
          );
        }
      }
      return parseBlock(part);
    });
  };

  if (document.status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-4">
        <Loader2 className="w-12 h-12 text-primaryForeground animate-spin" />
        <h3 className="text-xl font-bold text-textHeading">Generating Document...</h3>
        <p className="text-textBody max-w-md">The AI is currently drafting '{document.title}'. This may take a moment.</p>
        <div className="w-full max-w-sm bg-surfaceSecondary rounded-full h-2 mt-2">
            <div className="bg-primaryForeground h-2 rounded-full animate-pulse" style={{ width: `${document.progress || 25}%` }}></div>
        </div>
        <p className="text-xs text-textMuted">{document.phase || 'Analyzing requirements...'}</p>
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <FileText size={48} className="mb-4 text-textMuted/30" />
        <h3 className="text-lg font-bold text-textHeading">Document is empty</h3>
        <p className="text-textBody">Click 'Regenerate' to create this document.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-4xl mx-auto pb-20 bg-surface rounded-card p-8 shadow-subtle border border-border">
          {renderMarkdown(content)}
        </div>
      </div>
      <div className="bg-surface/80 backdrop-blur-sm border-t border-border p-4 sticky bottom-0">
         <div className="max-w-4xl mx-auto flex gap-2">
            <div className="relative flex-1">
               <Wand2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primaryForeground" />
               <input 
                  type="text" 
                  value={refineInstruction}
                  onChange={(e) => setRefineInstruction(e.target.value)}
                  placeholder="Ask AI to refine this document... (e.g. 'Make this more professional')"
                  className="w-full bg-surfaceSecondary border border-border rounded-pill pl-12 pr-4 py-4 text-sm focus:border-primary/50 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
               />
            </div>
            <button 
               onClick={handleRefine}
               disabled={!refineInstruction.trim() || isRefining}
               className="px-6 bg-accentDark hover:opacity-90 text-white rounded-pill disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold flex items-center gap-2"
            >
               {isRefining ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
               Refine
            </button>
         </div>
      </div>
    </div>
  );
};

export default DocViewer;