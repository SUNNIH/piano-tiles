
import React, { useState } from 'react';
import { Play, Loader2, Copy, Check, Terminal, Folder, File, Music, ChevronDown, FileCode } from 'lucide-react';
import { CppFramework, GeneratedCode } from '../types';
import { generateCppCode } from '../services/geminiService';

interface CodeGeneratorProps {
  bgmName: string;
  bgmVolume: number;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ 
  bgmName, bgmVolume
}) => {
  const [framework, setFramework] = useState<CppFramework>(CppFramework.SFML);
  const [result, setResult] = useState<GeneratedCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState<'main.cpp' | 'documentation'>('main.cpp');

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    const data = await generateCppCode(
      framework,
      bgmName,
      bgmVolume,
      "Implement a high-performance rendering loop with synchronized audio playback."
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
            <span className="text-gray-400 text-xs ml-2">AudioForge_CPP_Project - IDE</span>
        </div>
        <div className="flex items-center gap-3">
             <select 
                value={framework}
                onChange={(e) => setFramework(e.target.value as CppFramework)}
                className="bg-[#3c3c3c] text-gray-300 border-none text-xs rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
            >
                {(Object.values(CppFramework) as string[]).map((fw) => (
                <option key={fw} value={fw}>{fw}</option>
                ))}
            </select>
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded text-xs transition-colors disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Generate Source
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 bg-[#252526] border-r border-[#1e1e1e] flex flex-col">
            <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Explorer</div>
            <div className="mt-1">
                <div 
                    onClick={() => setActiveFile('main.cpp')}
                    className={`px-4 py-1 flex items-center gap-2 cursor-pointer ${activeFile === 'main.cpp' ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
                >
                    <FileCode className="w-3 h-3 text-purple-400" />
                    <span>main.cpp</span>
                </div>
                <div className="px-4 py-1 flex items-center gap-2 text-gray-400">
                    <Folder className="w-3 h-3 text-yellow-600" />
                    <span>assets</span>
                </div>
                <div className="px-8 py-1 flex items-center gap-2 text-gray-500 italic text-[10px]">
                    <Music className="w-2 h-2" />
                    <span className="truncate">{bgmName}</span>
                </div>
                <div 
                    onClick={() => setActiveFile('documentation')}
                    className={`px-4 py-1 flex items-center gap-2 cursor-pointer ${activeFile === 'documentation' ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
                >
                    <File className="w-3 h-3 text-blue-400" />
                    <span>README.md</span>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-[#1e1e1e] flex flex-col overflow-hidden relative">
            <div className="flex bg-[#252526]">
                <div className={`px-4 py-2 text-xs border-t-2 ${activeFile === 'main.cpp' ? 'bg-[#1e1e1e] text-white border-blue-500' : 'bg-[#2d2d2d] text-gray-500 border-transparent'}`}>
                    main.cpp
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar p-4 relative">
                {activeFile === 'main.cpp' ? (
                    result ? (
                        <>
                            <button onClick={handleCopy} className="absolute right-4 top-4 p-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-300 rounded z-10">
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <pre className="text-[#d4d4d4] font-mono text-sm leading-relaxed">
                                <code>{result.code}</code>
                            </pre>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                            <Terminal className="w-12 h-12 mb-3 opacity-20" />
                            <p>Select framework and click 'Generate Source'</p>
                        </div>
                    )
                ) : (
                    <div className="text-gray-400 p-4 space-y-4">
                        <h2 className="text-xl font-bold text-white">Project Build Specs</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#252526] p-3 rounded border border-[#333]">
                                <p className="text-[10px] uppercase text-gray-500 mb-1">Framework</p>
                                <p className="text-blue-400 font-bold">{framework}</p>
                            </div>
                            <div className="bg-[#252526] p-3 rounded border border-[#333]">
                                <p className="text-[10px] uppercase text-gray-500 mb-1">Language</p>
                                <p className="text-green-400 font-bold">C++ 17</p>
                            </div>
                        </div>
                        {result?.explanation && (
                            <div className="bg-[#252526] p-4 rounded border border-[#333]">
                                <h3 className="text-white font-bold mb-2">Implementation Notes</h3>
                                <p className="text-xs leading-relaxed">{result.explanation}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
