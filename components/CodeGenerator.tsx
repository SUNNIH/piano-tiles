
import React, { useState } from 'react';
import { Play, Loader2, Copy, Check, Terminal, Folder, File, Music, ChevronDown, FileCode, Hammer, ArrowLeft, Download, Info, Settings2, Package } from 'lucide-react';
import { CppFramework, GeneratedCode } from '../types';
import { generateCppProject } from '../services/geminiService';

interface CodeGeneratorProps {
  bgmName: string;
  bgmVolume: number;
  onBack: () => void;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ 
  bgmName, bgmVolume, onBack
}) => {
  const [framework, setFramework] = useState<CppFramework>(CppFramework.SFML);
  const [result, setResult] = useState<GeneratedCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'SOURCE' | 'BUILD' | 'DEPENDENCIES'>('SOURCE');

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    const data = await generateCppProject(
      framework,
      bgmName,
      bgmVolume,
      "Create a robust background music player that reads from a config file or external asset directory. Ensure low CPU overhead for the audio thread."
    );
    setResult(data);
    setLoading(false);
  };

  const handleCopy = () => {
    let textToCopy = "";
    if (activeTab === 'SOURCE') textToCopy = result?.code || "";
    else if (activeTab === 'BUILD') textToCopy = result?.cmake || "";
    else textToCopy = result?.explanation || "";

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderDependencyGuide = () => {
    const guides = {
      [CppFramework.SFML]: {
        win: "vcpkg install sfml:x64-windows",
        mac: "brew install sfml",
        linux: "sudo apt-get install libsfml-dev"
      },
      [CppFramework.SDL2]: {
        win: "vcpkg install sdl2:x64-windows",
        mac: "brew install sdl2",
        linux: "sudo apt-get install libsdl2-dev"
      },
      [CppFramework.RAYLIB]: {
        win: "vcpkg install raylib:x64-windows",
        mac: "brew install raylib",
        linux: "sudo apt-get install libraylib-dev"
      },
      [CppFramework.OPENGL]: {
        win: "vcpkg install glfw3 glew:x64-windows",
        mac: "brew install glfw glew",
        linux: "sudo apt-get install libglfw3-dev libglew-dev"
      }
    };

    const current = guides[framework];

    return (
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div>
          <h3 className="text-cyan-400 font-black text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
             <Package size={16} /> Dependency Lab: {framework}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed mb-6">
            To compile C++ projects locally, you need a Package Manager. We recommend <b>vcpkg</b> for Windows and <b>Homebrew</b> for macOS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {Object.entries(current).map(([os, cmd]) => (
             <div key={os} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">{os === 'win' ? 'Windows' : os === 'mac' ? 'macOS' : 'Linux'}</div>
                <code className="text-xs text-cyan-200 block bg-black/40 p-2 rounded border border-cyan-500/20 break-all select-all">{cmd}</code>
             </div>
           ))}
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-4 items-start">
           <Info className="text-blue-400 shrink-0" size={18} />
           <p className="text-[11px] text-blue-300 leading-relaxed">
             <b>Note:</b> You must have a C++ compiler installed (MSVC on Windows, Clang on Mac, or GCC on Linux) and <b>CMake</b> configured in your System PATH.
           </p>
        </div>

        {result?.explanation && (
           <div className="mt-8 border-t border-white/5 pt-8">
              <h4 className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Gemini Integration Guide</h4>
              <pre className="text-xs text-gray-400 whitespace-pre-wrap font-sans leading-relaxed">
                {result.explanation}
              </pre>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#0a0a0c] flex flex-col p-6 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white/60 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">C++ AUDIO FORGE</h1>
              <p className="text-cyan-400/60 text-[9px] font-bold tracking-[0.3em] uppercase mt-1">Native Synthesis SDK</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1">
                {(['SOURCE', 'BUILD', 'DEPENDENCIES'] as const).map(tab => (
                   <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-cyan-500 text-black' : 'text-white/40 hover:text-white'}`}
                   >
                    {tab}
                   </button>
                ))}
             </div>

             <select 
                value={framework}
                onChange={(e) => setFramework(e.target.value as CppFramework)}
                className="bg-slate-900 text-white border border-white/10 text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2.5 focus:ring-1 focus:ring-cyan-500 outline-none"
            >
                {(Object.values(CppFramework) as string[]).map((fw) => (
                <option key={fw} value={fw}>{fw}</option>
                ))}
            </select>
            
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95 shadow-[0_0_20px_rgba(0,242,255,0.3)]"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hammer className="w-4 h-4" />}
                {result ? "RE-FORGE" : "FORGE SDK"}
            </button>
        </div>
      </div>

      {/* Main IDE Interface */}
      <div className="flex-1 bg-[#1e1e1e] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl font-mono text-sm relative">
        {/* IDE Title Bar */}
        <div className="bg-[#2d2d2d] px-4 py-3 flex items-center justify-between border-b border-[#1e1e1e]">
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                <span className="text-gray-400 text-[10px] ml-4 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                  <Terminal size={12} className="text-cyan-500" />
                  Project: AudioEngine_{framework.replace(' ', '_')}
                </span>
            </div>
            {result && (
              <div className="flex gap-2">
                  <button onClick={handleCopy} className="p-2 hover:bg-white/5 text-gray-400 rounded-lg transition-colors flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                  </button>
              </div>
            )}
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar / Explorer */}
            <div className="w-48 bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0">
                <div className="px-4 py-3 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">Workspace Explorer</div>
                <div className="mt-2">
                    <div 
                        onClick={() => setActiveTab('SOURCE')}
                        className={`px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'SOURCE' ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
                    >
                        <FileCode className="w-3 h-3" />
                        <span className="text-[11px] font-bold">main.cpp</span>
                    </div>
                    <div 
                        onClick={() => setActiveTab('BUILD')}
                        className={`px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'BUILD' ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
                    >
                        <Hammer className="w-3 h-3" />
                        <span className="text-[11px] font-bold">CMakeLists.txt</span>
                    </div>
                    <div 
                        onClick={() => setActiveTab('DEPENDENCIES')}
                        className={`px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors ${activeTab === 'DEPENDENCIES' ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500' : 'text-gray-400 hover:bg-[#2a2d2e]'}`}
                    >
                        <Package className="w-3 h-3" />
                        <span className="text-[11px] font-bold">Dependencies</span>
                    </div>
                    <div className="mt-4 px-4 py-3 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] border-t border-white/5">Assets</div>
                    <div className="px-4 py-2 flex items-center gap-2 text-cyan-400/40 italic text-[10px]">
                        <Music className="w-3 h-3" />
                        <span className="truncate">{bgmName || "default.mp3"}</span>
                    </div>
                </div>
            </div>

            {/* Code Editor Area */}
            <div className="flex-1 bg-[#1e1e1e] flex flex-col overflow-hidden relative">
                {result ? (
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        {activeTab === 'DEPENDENCIES' ? (
                          renderDependencyGuide()
                        ) : (
                          <div className="p-6">
                             <pre className="text-[#d4d4d4] font-mono text-xs leading-relaxed whitespace-pre">
                                <code>
                                  {activeTab === 'SOURCE' ? result.code : result.cmake}
                                </code>
                            </pre>
                          </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 animate-pulse">
                        <Terminal className="w-16 h-16 mb-6 opacity-20" />
                        <p className="text-[10px] uppercase tracking-[0.5em] font-black">Awaiting Configuration Data</p>
                        <div className="mt-8 flex gap-2">
                           {[...Array(3)].map((_, i) => (
                             <div key={i} className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                           ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-6 flex justify-between items-center text-[9px] text-white/20 font-black uppercase tracking-[0.4em] px-2">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><Settings2 size={12} className="text-purple-500" /> C++ 17 Engine</span>
            <span className="flex items-center gap-2"><Hammer size={12} className="text-cyan-500" /> CMake Builder</span>
            <span className="flex items-center gap-2"><Package size={12} className="text-green-500" /> Multi-Platform ready</span>
         </div>
         <span className="italic">Build 2.5.4-NATIVE-BGM-SYSTEM</span>
      </div>
    </div>
  );
};

export default CodeGenerator;
