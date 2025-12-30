
import React, { useState } from 'react';
import { Play, Loader2, Copy, Check, Terminal, Folder, File, Music, ChevronDown, FileJson } from 'lucide-react';
import { GeneratedCode } from '../types';
import { generateCppCode } from '../services/geminiService';

interface CodeGeneratorProps {
  bgmName: string;
  bgmVolume: number;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ 
  bgmName, bgmVolume
}) => {
  const [result, setResult] = useState<GeneratedCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState<'main.cpp' | 'readme'>('main.cpp');

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    const data = await generateCppCode(
      bgmName,
      bgmVolume,
      "Use modern C++17 standards and clean class structure."
    );
    setResult(data);
    setLoading(false);
  };

  const handleCopy = () => {
    if (result?.code) {
      navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#1e1e1e] border border-[#333] rounded-xl overflow-hidden flex flex-col h-full shadow-2xl font-mono text-sm">
      <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-[#1e1e1e]">
        <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="text-gray-400 text-xs ml-2">PianoTilesCPP - VS Code</span>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Build C++
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 bg-[#252526] border-r border-[#1e1e1e] flex flex-col">
            <div className="mt-1">
                <div className="px-2 py-1 flex items-center gap-1 text-gray-300">
                    <ChevronDown className="w-3 h-3" />
                    <span className="font-bold text-xs uppercase">Project</span>
                </div>
                <div className="flex flex-col">
                    <div 
                        onClick={() => setActiveFile('main.cpp')}
                        className={`px-6 py-1 flex items-center gap-2 cursor-pointer ${activeFile === 'main.cpp' ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
                    >
                        <File className="w-3 h-3 text-blue-400" />
                        <span>main.cpp</span>
                    </div>
                    <div className="px-6 py-1 flex items-center gap-2 text-gray-400">
                        <Folder className="w-3 h-3 text-yellow-600" />
                        <span>assets</span>
                    </div>
                    <div 
                        onClick={() => setActiveFile('readme')}
                        className={`px-6 py-1 flex items-center gap-2 cursor-pointer ${activeFile === 'readme' ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
                    >
                        <FileJson className="w-3 h-3 text-yellow-400" />
                        <span>README.md</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-[#1e1e1e] flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-auto p-4 relative">
                {activeFile === 'main.cpp' ? (
                    result ? (
                        <>
                            <button onClick={handleCopy} className="absolute right-4 top-4 p-2 bg-[#2d2d2d] rounded text-gray-300">
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <pre className="text-[#d4d4d4] font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                <code>{result.code}</code>
                            </pre>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                            <Terminal className="w-12 h-12 mb-3 opacity-20" />
                            <p>Generate C++ SFML code</p>
                        </div>
                    )
                ) : (
                     <div className="text-gray-400 p-4">
                        <h1 className="text-xl font-bold text-white mb-4">C++ SFML Setup</h1>
                        <p className="mb-2">Ensure you have SFML installed on your system.</p>
                        <code className="block bg-black p-2 rounded mb-4 text-green-400">
                            sudo apt-get install libsfml-dev
                        </code>
                        <p className="text-xs">{result?.explanation || "No build notes available."}</p>
                     </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
