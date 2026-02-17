
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Location, LanguageCode } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAgentProps {
  userLocation: Location | null;
  onMessageSent?: (text: string) => void;
  selectedLanguage?: LanguageCode;
}

// Helper: Base64 Decoding for PCM
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Base64 Encoding for PCM
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: PCM Decoding to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AIAgent: React.FC<AIAgentProps> = ({ userLocation, onMessageSent, selectedLanguage = 'en' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [aiTranscription, setAiTranscription] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // PCM Blob Creation for Input
  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopLiveSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsLive(false);
    activeSourcesRef.current.forEach(s => s.stop());
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const startLiveSession = async () => {
    if (isLive) {
      stopLiveSession();
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts
      if (!audioContextsRef.current) {
        audioContextsRef.current = {
          input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
          output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 })
        };
      }

      const { input: inCtx, output: outCtx } = audioContextsRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Playback
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.addEventListener('ended', () => activeSourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              activeSourcesRef.current.add(source);
            }

            // Handle Transcription
            if (message.serverContent?.inputTranscription) {
              setCurrentTranscription(prev => prev + (message.serverContent?.inputTranscription?.text || ''));
            }
            if (message.serverContent?.outputTranscription) {
              setAiTranscription(prev => prev + (message.serverContent?.outputTranscription?.text || ''));
            }

            // Handle Completion
            if (message.serverContent?.turnComplete) {
              setMessages(prev => [
                ...prev, 
                { role: 'user', text: currentTranscription || "Voice query" },
                { role: 'model', text: aiTranscription || "Processed voice response" }
              ]);
              setCurrentTranscription('');
              setAiTranscription('');
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            stopLiveSession();
          },
          onclose: () => {
            setIsLive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are the NEARBY AI Voice Concierge. 
          Current Mode: Real-time Multilingual Interaction.
          Current Language: ${selectedLanguage}. 
          Location Context: ${userLocation ? `Lat ${userLocation.latitude}, Lng ${userLocation.longitude}` : 'Global'}.
          Rule 1: ALWAYS respond in ${selectedLanguage}. 
          Rule 2: Be helpful, conversational, and direct.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start Live session", err);
      alert("Please ensure microphone access is granted and your API key is valid.");
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, currentTranscription, aiTranscription]);

  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] md:w-[450px] h-[650px] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Header */}
          <div className="bg-slate-900 dark:bg-slate-950 p-6 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-2xl transition-all duration-500 ${isLive ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'}`}>
                {isLive ? '📞' : 'N'}
              </div>
              <div>
                <h4 className="text-white font-black text-sm leading-tight">
                  {isLive ? 'Live Voice Session' : 'AI Concierge'}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`}></span>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{selectedLanguage} Mode</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2 text-xl">✕</button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="flex-grow p-8 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar relative">
            
            {/* Live Visualizer Overlay */}
            {isLive && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-500">
                <div className="relative mb-12">
                   <div className="w-40 h-40 rounded-full bg-indigo-500/10 border border-indigo-500/20 animate-neural-pulse"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl shadow-2xl brand-glow animate-bounce">🎙️</div>
                   </div>
                </div>
                
                <div className="max-w-[80%] text-center space-y-4">
                  <p className="text-[11px] font-mono font-black text-indigo-500 uppercase tracking-[0.4em] animate-pulse">Session Active</p>
                  <div className="space-y-2">
                    {currentTranscription && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-bold animate-in slide-in-from-bottom-2 italic">“{currentTranscription}”</p>
                    )}
                    {aiTranscription && (
                      <p className="text-indigo-600 dark:text-indigo-400 text-lg font-black tracking-tight animate-in slide-in-from-bottom-2 leading-tight">{aiTranscription}</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={stopLiveSession}
                  className="mt-12 px-10 py-4 bg-rose-600 text-white rounded-[1.8rem] text-[11px] font-mono font-black uppercase tracking-widest shadow-2xl hover:bg-rose-700 transition-all"
                >
                  End Voice Interaction
                </button>
              </div>
            )}

            {/* Chat History */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] px-5 py-4 rounded-[1.5rem] text-xs font-semibold leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Interaction Bar */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            {!isLive ? (
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={startLiveSession}
                  className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[2rem] font-display font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl flex items-center justify-center space-x-3 hover:scale-[1.02] transition-all"
                >
                  <span>🎙️ Start Voice Interaction</span>
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                </button>
                <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow bg-transparent border-none text-sm font-semibold px-4 py-3 outline-none text-slate-900 dark:text-white"
                  />
                  <button 
                    onClick={() => {
                      if (!input.trim()) return;
                      setMessages(prev => [...prev, { role: 'user', text: input }]);
                      setInput('');
                      // Fallback text logic here if needed, but we focus on Live
                    }}
                    className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black"
                  >
                    ↑
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Hands-free interaction active. Just speak.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-20 h-20 rounded-full shadow-[0_20px_50px_rgba(99,102,241,0.3)] flex items-center justify-center text-3xl transition-all duration-500 hover:scale-110 active:scale-95 group relative overflow-hidden ${isOpen ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rotate-90' : 'bg-indigo-600 text-white'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? '✕' : isLive ? '🔊' : '✨'}
        {!isOpen && (
           <span className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
        )}
      </button>
    </div>
  );
};

export default AIAgent;
