import React, { useState, useEffect } from 'react';
import { ChevronLeft, Settings, Star, Bomb, Clock, ShieldCheck, Cpu } from 'lucide-react';
import { AppView, PredictionData, TrapConfig } from '../types';
import { generatePrediction, getTanzaniaTime, to12H, isTimeInPast } from '../utils/algorithm';

interface MinesViewProps {
  mode: 'mines-1' | 'mines-2' | 'mines-3' | 'mines-4';
  prediction: PredictionData | null;
  onSetPrediction: (pred: PredictionData | null) => void;
  onBack: () => void;
  onToast: (msg: string) => void;
}

export const MinesView: React.FC<MinesViewProps> = ({
  mode,
  prediction,
  onSetPrediction,
  onBack,
  onToast,
}) => {
  const isStars = mode === 'mines-1' || mode === 'mines-3';
  const isFixed7x7 = mode === 'mines-3' || mode === 'mines-4';
  
  const modeTitle = mode === 'mines-1'
    ? 'Stars Mode'
    : mode === 'mines-2'
    ? 'Bombs Mode'
    : mode === 'mines-3'
    ? 'Mines ya Nyota 7x7 (7 Safe / 7 Traps)'
    : 'Mines ya Mabomu 7x7 (7 Safe / 7 Bombs)';

  const trapTitle = isStars ? 'TRAP CONFIGURATION' : 'BOMB CONFIGURATION';
  const trapLabel = isStars ? 'Traps' : 'Bombs';

  const [trapConfig, setTrapConfig] = useState<TrapConfig>(7);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [tzTime, setTzTime] = useState<string>(getTanzaniaTime());
  const [nowMs, setNowMs] = useState<number>(Date.now());

  // Time selection states
  const [selectedHour, setSelectedHour] = useState<string>(() => {
    const h = new Date().getHours() % 12 || 12;
    return String(h).padStart(2, '0');
  });
  const [selectedMinute, setSelectedMinute] = useState<string>(() => {
    return String(new Date().getMinutes()).padStart(2, '0');
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(() => {
    return new Date().getHours() >= 12 ? 'PM' : 'AM';
  });

  // Real-time local clock and date state
  const [liveClock, setLiveClock] = useState<string>('');
  const [liveDateStr, setLiveDateStr] = useState<string>('');

  const selectedTimeFormatted = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
  const isSelectedTimeInPast = isTimeInPast(selectedTimeFormatted);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));

      const days = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
      const dayName = days[now.getDay()];
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      setLiveDateStr(`${dayName}, ${dd}/${mm}/${yyyy}`);
      setTzTime(getTanzaniaTime());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer & auto-refresh lifecycle control
  useEffect(() => {
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNowMs(currentNow);

      if (prediction) {
        // Auto-refresh when signal play duration expires
        if (currentNow >= prediction.expiryTimestamp) {
          onSetPrediction(null);
          onToast(`Muda wa kucheza signal ya ${prediction.playTime} umeisha! Mfumo umejirefresh kutoa signal ijayo.`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prediction, onSetPrediction, onToast]);

  const formatSecs = (totalSecs: number) => {
    const mins = Math.floor(Math.max(0, totalSecs) / 60);
    const secs = Math.max(0, totalSecs) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isWaitingForPlayTime = prediction ? nowMs < prediction.playTimestamp : false;
  const isActivelyPlaying = prediction ? (nowMs >= prediction.playTimestamp && nowMs < prediction.expiryTimestamp) : false;
  
  const secondsUntilStart = prediction ? Math.max(0, Math.round((prediction.playTimestamp - nowMs) / 1000)) : 0;
  const secondsRemainingPlay = prediction ? Math.max(0, Math.round((prediction.expiryTimestamp - nowMs) / 1000)) : 0;

  const handleConfigSelect = (cfg: TrapConfig) => {
    setTrapConfig(cfg);
    onToast(`Imebadilishwa kuwa Mabomu/Traps ${cfg}`);
  };

  const handleQuickPreset = (type: 'now' | 1 | 2 | 5) => {
    const now = new Date();
    if (type === 'now') {
      const h12 = now.getHours() % 12 || 12;
      setSelectedHour(String(h12).padStart(2, '0'));
      setSelectedMinute(String(now.getMinutes()).padStart(2, '0'));
      setSelectedPeriod(now.getHours() >= 12 ? 'PM' : 'AM');
      onToast("Muda umewekwa kuwa Muda wa Sasa");
    } else {
      let h = parseInt(selectedHour, 10);
      if (selectedPeriod === 'PM' && h < 12) h += 12;
      if (selectedPeriod === 'AM' && h === 12) h = 0;
      
      let totalMin = h * 60 + parseInt(selectedMinute, 10) + type;
      totalMin = (totalMin + 1440) % 1440;
      
      const newH24 = Math.floor(totalMin / 60);
      const newM = totalMin % 60;
      const newPeriod: 'AM' | 'PM' = newH24 >= 12 ? 'PM' : 'AM';
      const newH12 = newH24 % 12 || 12;
      
      setSelectedHour(String(newH12).padStart(2, '0'));
      setSelectedMinute(String(newM).padStart(2, '0'));
      setSelectedPeriod(newPeriod);
      onToast(`Imeongezwa +${type} Min`);
    }
  };

  const handleGenerate = () => {
    if (isScanning || prediction) return;

    const formattedCustomTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

    if (isTimeInPast(formattedCustomTime)) {
      onToast("❌ Mfumo hauruhusiwi kutoa signal ya muda uliopita! Chagua muda wa sasa au ujao.");
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const step = ((prev * 7 + 13) % 9) + 5;
        const next = prev + step;

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            const pred = generatePrediction(mode, trapConfig, formattedCustomTime);
            onSetPrediction(pred);
            onToast(`Signal ya ${formattedCustomTime} imepatikana!`);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 120);
  };

  // Safe Star SVG - Yellow glowing star for Mines 1 (Stars Mode)
  const renderGoldStar = () => (
    <svg viewBox="0 0 100 100" className="w-[82%] h-[82%] drop-shadow-[0_0_14px_rgba(250,204,21,0.9)] relative z-10 transform hover:scale-105 transition-transform duration-300">
      <defs>
        <linearGradient id="gYellowStar" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff066" />
          <stop offset="35%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <path
        d="M 50 10 Q 52.5 10 62.5 32 Q 65 36 89 37 Q 93.5 37 73 57 Q 70 60 78 83 Q 80 87 50 72 Q 47 71 22 83 Q 18 85 26 57 Q 29 54 11 37 Q 6.5 37 31 32 Q 34 31 50 10 Z"
        fill="url(#gYellowStar)"
        stroke="#d97706"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Blue 3D Star SVG for Mines 2 (Picture 1)
  const renderBlueStar = () => (
    <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] drop-shadow-[0_4px_12px_rgba(37,99,235,0.8)] relative z-10 transform hover:scale-110 transition-transform duration-300">
      <defs>
        <linearGradient id="blueStarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="blueStarFacet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1e40af" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        d="M 50 8 Q 52 8 63 32 Q 65 35 91 36 Q 95 36 71 58 Q 68 61 77 87 Q 79 91 50 75 Q 48 74 23 87 Q 19 89 27 61 Q 30 58 7 36 Q 3 34 37 32 Q 40 31 50 8 Z"
        fill="url(#blueStarGrad)"
        stroke="#1e3a8a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 50 8 L 50 52 L 63 32 Z M 91 36 L 50 52 L 71 58 Z M 77 87 L 50 52 L 50 75 Z M 23 87 L 50 52 L 27 61 Z M 7 36 L 50 52 L 37 32 Z"
        fill="url(#blueStarFacet)"
      />
    </svg>
  );

  return (
    <div className="w-full flex flex-col space-y-5 transition-all duration-300">
      {/* Top Header Row: Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className={`px-4.5 py-2.5 rounded-xl border ${
            isStars
              ? 'border-amber-500/35 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40'
              : 'border-cyan-500/35 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-950/40'
          } text-[10.5px] font-mono font-black uppercase tracking-wider transition-all select-none flex items-center gap-2 cursor-pointer active:scale-95 w-fit`}
        >
          <ChevronLeft className={`w-4.5 h-4.5 ${isStars ? 'text-amber-400' : 'text-cyan-400'}`} />
          <span>Back to Hub</span>
        </button>
      </div>

      {/* Mode Title Banner */}
      <div className={`p-4 rounded-2xl border ${isStars ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'} shadow-xl flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <ShieldCheck className={`w-6 h-6 ${isStars ? 'text-amber-400' : 'text-cyan-400'} shrink-0`} />
          <div>
            <h2 className={`text-xs sm:text-sm font-mono font-black uppercase tracking-wider ${isStars ? 'text-amber-300' : 'text-cyan-300'}`}>
              {modeTitle}
            </h2>
            <p className="text-[10.5px] font-sans text-slate-300 leading-tight">
              AI Pattern Analysis Engine
            </p>
          </div>
        </div>
      </div>

      {/* Trap Configuration Selector */}
      <div className={`bg-[#09101f]/85 border ${isStars ? 'border-amber-500/25' : 'border-cyan-500/25'} rounded-2xl p-5 shadow-2xl`}>
        <div className={`flex items-center space-x-2.5 ${isStars ? 'text-amber-400' : 'text-cyan-400'} font-bold font-mono border-b ${isStars ? 'border-amber-500/10' : 'border-cyan-500/10'} pb-2 mb-4`}>
          <Settings className={`w-4.5 h-4.5 ${isStars ? 'text-amber-400' : 'text-cyan-400'}`} />
          <span className="text-[11.5px] uppercase tracking-wide">{trapTitle}</span>
        </div>
        {isFixed7x7 ? (
          <div className={`p-4 rounded-xl border font-mono text-center ${
            isStars
              ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'bg-cyan-500/15 border-cyan-500/60 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
          }`}>
            <span className="text-xs sm:text-sm font-black tracking-wider uppercase block">
              ⚡ SIGNAL MODE: 7 SAFE TILES & 7 {trapLabel.toUpperCase()} (7x7)
            </span>
            <span className="text-[10px] text-emerald-400 font-bold tracking-tight block mt-1">
              Fixed configuration algorithm active
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {([3, 5, 7] as TrapConfig[]).map((cfg) => {
              const isSelected = trapConfig === cfg;
              return (
                <button
                  key={cfg}
                  onClick={() => handleConfigSelect(cfg)}
                  className={`p-3.5 rounded-xl border font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 text-center ${
                    isSelected
                      ? isStars
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : isStars
                        ? 'border-amber-500/30 bg-[#0b101f]/80 hover:bg-[#10172c] text-amber-300'
                        : 'border-cyan-500/30 bg-[#0b101f]/80 hover:bg-[#10172c] text-cyan-300'
                  }`}
                >
                  {trapLabel}: {cfg}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User-Controlled Signal Time Selection Interface */}
      <div className={`bg-[#09101f]/90 border ${isStars ? 'border-amber-500/30' : 'border-cyan-500/30'} rounded-2xl p-5 shadow-2xl relative overflow-hidden`}>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5 mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full ${isStars ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'} flex items-center justify-center shrink-0`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-xs sm:text-sm font-mono font-black uppercase tracking-wider ${isStars ? 'text-amber-300' : 'text-cyan-300'}`}>
                MIPANGILIO YA MUDA WA SIGNAL
              </h3>
              <p className="text-[10.5px] text-slate-400 font-sans tracking-tight">
                Weka saa na dakika unazotaka kutoa signal (AM/PM 12-Hour)
              </p>
            </div>
          </div>

          <div className={`self-start sm:self-auto px-3.5 py-1.5 rounded-full font-mono font-extrabold text-xs border ${
            isStars ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
          }`}>
            MUDA: {selectedHour}:{selectedMinute} {selectedPeriod}
          </div>
        </div>

        {/* Time Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Hour Selector */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              SAA (HOUR)
            </label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className={`w-full bg-[#060a14] border ${isStars ? 'border-amber-500/40 text-amber-300 focus:border-amber-400' : 'border-cyan-500/40 text-cyan-300 focus:border-cyan-400'} rounded-xl py-2.5 px-3 font-mono text-sm font-black outline-none transition-all cursor-pointer`}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const val = String(i + 1).padStart(2, '0');
                return <option key={val} value={val} className="bg-[#0b101f] text-white">{val}</option>;
              })}
            </select>
          </div>

          {/* Minute Selector */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              DAKIKA (MINUTE)
            </label>
            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(e.target.value)}
              className={`w-full bg-[#060a14] border ${isStars ? 'border-amber-500/40 text-amber-300 focus:border-amber-400' : 'border-cyan-500/40 text-cyan-300 focus:border-cyan-400'} rounded-xl py-2.5 px-3 font-mono text-sm font-black outline-none transition-all cursor-pointer`}
            >
              {Array.from({ length: 60 }, (_, i) => {
                const val = String(i).padStart(2, '0');
                return <option key={val} value={val} className="bg-[#0b101f] text-white">{val}</option>;
              })}
            </select>
          </div>

          {/* AM / PM Format Toggle */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              FORMAT (AM/PM)
            </label>
            <div className="grid grid-cols-2 gap-2 h-[42px]">
              <button
                type="button"
                onClick={() => setSelectedPeriod('AM')}
                className={`w-full h-full rounded-xl font-mono text-xs font-black uppercase transition-all cursor-pointer ${
                  selectedPeriod === 'AM'
                    ? isStars
                      ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      : 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                    : 'bg-[#060a14] border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('PM')}
                className={`w-full h-full rounded-xl font-mono text-xs font-black uppercase transition-all cursor-pointer ${
                  selectedPeriod === 'PM'
                    ? isStars
                      ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      : 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                    : 'bg-[#060a14] border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider mr-1">
            CHAGUA HARAKA:
          </span>

          <button
            type="button"
            onClick={() => handleQuickPreset('now')}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center space-x-1 ${
              isStars
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
            }`}
          >
            <span>⚡ Muda wa Sasa</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset(1)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#060a14] hover:bg-slate-800 text-[11px] font-mono font-bold text-slate-200 transition-all cursor-pointer"
          >
            +1 Min
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset(2)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#060a14] hover:bg-slate-800 text-[11px] font-mono font-bold text-slate-200 transition-all cursor-pointer"
          >
            +2 Min
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset(5)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-[#060a14] hover:bg-slate-800 text-[11px] font-mono font-bold text-slate-200 transition-all cursor-pointer"
          >
            +5 Min
          </button>
        </div>
      </div>

      {/* Real-Time Date & Time Display Module */}
      <div className={`bg-[#09101f]/90 border ${isStars ? 'border-amber-500/20' : 'border-cyan-500/20'} rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
        <div className="flex flex-col">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
            SAA YA KIFAA (LOCAL TIME):
          </span>
          <span className="text-[10px] font-sans font-semibold text-slate-500">
            {liveDateStr}
          </span>
        </div>
        <span className={`text-xl sm:text-2xl font-mono font-black tracking-widest ${isStars ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]'}`}>
          {liveClock || tzTime}
        </span>
      </div>

      {/* Grid Board & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column: Grid */}
        <div className="md:col-span-6">
          <div className={`bg-[#09101f]/85 border ${isStars ? 'border-amber-500/15' : 'border-cyan-500/15'} rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md`}>
            <div className={`relative w-full max-w-[380px] mx-auto p-3.5 sm:p-4.5 rounded-[28px] sm:rounded-[36px] ${
              isStars
                ? 'aspect-square bg-[#070c18] border-[4px] border-[#0c314b] shadow-[0_16px_50px_rgba(0,0,0,0.95)] flex items-center justify-center'
                : 'bg-[#0e121d] border-[4px] border-[#1a2132] shadow-[0_16px_50px_rgba(0,0,0,0.95)] flex flex-col space-y-3.5'
            } select-none overflow-hidden`}>
              
              {/* Scanline gradient effect */}
              <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-[#00f2ff]/3 to-transparent bg-size-[100%_40%] pointer-events-none z-10 ${isStars ? 'bg-amber-400/5' : 'bg-cyan-400/5'}`}></div>
              <div className={`absolute inset-1.5 rounded-[22px] sm:rounded-[30px] border ${isStars ? 'border-cyan-500/20' : 'border-slate-700/30'} pointer-events-none z-0`}></div>

              {/* Top Header inside board for Mines 2 (Bombs mode) */}
              {!isStars && (
                <div className="flex items-center justify-between w-full relative z-20 px-1 pt-0.5">
                  <div className="px-4 py-1.5 bg-[#171c2b] border border-[#232a3f] rounded-full font-mono font-bold text-xs sm:text-sm text-slate-100 shadow-inner flex items-center justify-center">
                    {prediction ? to12H(prediction.playTime) : '10:40 PM'}
                  </div>
                  <div className="px-3.5 py-1.5 bg-[#171c2b] border border-[#232a3f] rounded-full font-mono font-bold text-xs sm:text-sm text-slate-100 shadow-inner flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center shadow-[0_0_8px_rgba(220,38,38,0.8)] relative overflow-hidden">
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                        <circle cx="11" cy="14" r="5.5" fill="#1c1917" stroke="#292524" strokeWidth="0.5" />
                        <circle cx="9.5" cy="12.5" r="1.2" fill="#a8a29e" opacity="0.6" />
                        <rect x="10" y="7.5" width="2" height="1.5" rx="0.5" fill="#d6d3d1" />
                        <path d="M 11 7.5 Q 12.5 5.5 14.5 5.5" stroke="#f59e0b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                        <circle cx="15" cy="5" r="1.2" fill="#ef4444" />
                        <circle cx="15" cy="5" r="0.8" fill="#f97316" />
                        <circle cx="15" cy="5" r="0.4" fill="#fef08a" />
                      </svg>
                    </div>
                    <span className="font-mono font-black text-white text-xs sm:text-sm">
                      {prediction ? prediction.trapCount : trapConfig}
                    </span>
                  </div>
                </div>
              )}

              {/* 5x5 Tiles Grid */}
              <div className="grid grid-cols-5 gap-2 w-full aspect-square relative z-10">
                {Array.from({ length: 25 }, (_, i) => {
                  const isSafeTile = prediction?.safeTiles.includes(i);

                  if (isStars) {
                    // Mines 1 (Stars Mode) - Picture 2: Vibrant Cyan 3D tiles with top glare
                    return (
                      <div key={i} className="relative aspect-square w-full select-none">
                        {isSafeTile ? (
                          <div className="w-full h-full relative rounded-xl sm:rounded-2xl bg-[#050811] border border-yellow-500/40 shadow-[0_0_18px_rgba(250,204,21,0.4)] flex items-center justify-center overflow-hidden">
                            <div className="absolute w-[70%] h-[70%] bg-yellow-400/20 rounded-full blur-md pointer-events-none"></div>
                            {renderGoldStar()}
                          </div>
                        ) : (
                          <div className="w-full h-full relative rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#1eb2d0] via-[#108ea7] to-[#0a667b] border-2 border-[#094759] shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),_0_4px_10px_rgba(0,0,0,0.7)] flex items-center justify-center hover:brightness-110 active:scale-95 transition-all duration-150 cursor-pointer overflow-hidden">
                            <div className="absolute top-[1px] left-[1px] right-[1px] h-[35%] rounded-t-[10px] bg-gradient-to-b from-white/35 to-transparent pointer-events-none"></div>
                            <div className="absolute inset-[1px] rounded-lg sm:rounded-[14px] border border-cyan-200/20 pointer-events-none"></div>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // Mines 2 (Bombs Mode) - Picture 1 & 2: Dark charcoal tiles with sharp/subtly rounded corners (rounded-md) & 1W watermark
                    return (
                      <div key={i} className="relative aspect-square w-full select-none">
                        {isSafeTile ? (
                          <div className="w-full h-full relative rounded-md bg-gradient-to-b from-[#0e3b6d] to-[#082242] border border-[#2563eb]/70 shadow-[0_0_18px_rgba(37,99,235,0.6)] flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-radial from-[#3b82f6]/40 via-transparent to-transparent opacity-80 pointer-events-none"></div>
                            {renderBlueStar()}
                          </div>
                        ) : (
                          <div className="w-full h-full relative rounded-md bg-[#232732] border border-[#1d2029] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),_0_2px_4px_rgba(0,0,0,0.4)] flex items-center justify-center hover:brightness-110 active:scale-95 transition-all duration-150 cursor-pointer overflow-hidden">
                            <span className="text-[15px] sm:text-[18px] font-sans font-black italic tracking-normal text-[#525768] select-none transform -skew-x-6">
                              1W
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                })}
              </div>

              {/* Network Scan Analysis Overlay */}
              {isScanning && (
                <div className="absolute inset-0 bg-[#040915]/95 rounded-[24px] sm:rounded-[32px] flex flex-col items-center justify-center space-y-4 z-25 p-6 backdrop-blur-sm">
                  <div className="relative flex items-center justify-center">
                    <div className={`absolute w-16 h-16 rounded-full border-t-2 border-r-2 ${isStars ? 'border-amber-400' : 'border-cyan-400'} animate-spin`}></div>
                    <div className={`absolute w-12 h-12 rounded-full border-b-2 border-l-2 ${isStars ? 'border-cyan-500' : 'border-amber-500'} animate-spin`} style={{ animationDirection: 'reverse' }}></div>
                    {isStars ? (
                      <Star className="w-6 h-6 text-amber-400 animate-pulse fill-amber-400" />
                    ) : (
                      <Bomb className="w-6 h-6 text-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-center font-mono">
                    <div className={`text-xs font-black ${isStars ? 'text-amber-400' : 'text-cyan-400'} tracking-widest uppercase mb-1`}>
                      AI PATTERN ENGINE ANALYSIS
                    </div>
                    <div className={`text-[10px] font-bold ${isStars ? 'text-cyan-500' : 'text-amber-500'} tracking-wider`}>
                      PROGRESS: <span className="text-white text-xs">{scanProgress}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Under Board Badges (Rendered ONLY in Mines 1 Stars Mode) */}
            {isStars && (
              <div className="flex items-center justify-between w-full max-w-[380px] mx-auto mt-6 px-1">
                <div className="border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-amber-400 bg-[#030712]/90 rounded-full px-5 py-2.5 flex items-center justify-center font-mono text-[14px] font-black tracking-widest min-w-[130px]">
                  PLAY TIME: {prediction ? to12H(prediction.playTime) : '--'}
                </div>
                <div className="bg-[#030712]/95 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] rounded-3xl px-5 py-2 flex flex-col items-center justify-center select-none min-w-[130px]">
                  <div className="flex items-center space-x-2">
                    <span className="text-[17px] font-mono font-black text-white">
                      {prediction ? prediction.trapCount : '--'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400/80 font-bold uppercase tracking-wider -mt-0.5">
                    TRAPS
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Prediction Details & Action */}
        <div className="md:col-span-6 flex flex-col space-y-5">
          <div className={`bg-[#09101f]/85 border ${isStars ? 'border-amber-500/15' : 'border-cyan-500/15'} rounded-xl p-3.5 shadow-2xl`}>
            <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Success Rate:</span>
            <span className="text-xl font-mono font-black text-emerald-400 ml-2">
              {prediction ? `${prediction.successRate}%` : '--%'}
            </span>
          </div>

          <div className={`bg-[#09101f]/85 border ${isStars ? 'border-amber-500/15' : 'border-cyan-500/15'} rounded-2xl p-5 shadow-2xl`}>
            <div className="space-y-4">
              <h3 className={`text-xs font-mono font-bold uppercase tracking-widest ${
                isStars ? 'text-amber-400 border-amber-500/15' : 'text-cyan-400 border-cyan-500/15'
              } border-b pb-2 flex items-center justify-between`}>
                <span>AIPRO777 SYNC</span>
                <Cpu className="w-4 h-4" />
              </h3>
              <div className="grid grid-cols-1 gap-2.5 font-mono">
                <div className="bg-black/45 rounded-xl p-3 border border-slate-900 flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Safe Tiles</span>
                  <span className="text-xl font-black text-emerald-400">
                    {prediction ? prediction.safeCount : '--'}
                  </span>
                </div>
                <div className="bg-black/45 rounded-xl p-3 border border-slate-900 flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase text-slate-400">{trapLabel} Tiles</span>
                  <span className="text-xl font-black text-rose-500">
                    {prediction ? prediction.trapCount : '--'}
                  </span>
                </div>
                <div className="bg-black/45 rounded-xl p-3 border border-slate-900 flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Play Time</span>
                  <span className={`text-xl font-black ${isStars ? 'text-amber-300' : 'text-cyan-300'}`}>
                    {prediction ? to12H(prediction.playTime) : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className={`bg-[#09101f]/85 border ${isStars ? 'border-amber-500/15' : 'border-cyan-500/15'} rounded-2xl p-4.5 shadow-2xl`}>
            {prediction ? (
              isWaitingForPlayTime ? (
                <button
                  disabled
                  className="w-full p-4 rounded-xl font-mono text-xs font-black tracking-wider bg-amber-950/40 border border-amber-500/40 text-amber-300 cursor-not-allowed text-center space-y-1"
                >
                  <div>INASUBIRI MUDA WA SIGNAL ({prediction.playTime})</div>
                  <div className="text-[10.5px] text-amber-400/90 font-bold">
                    Kuanza Kucheza: {formatSecs(secondsUntilStart)}
                  </div>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full p-4 rounded-xl font-mono text-xs font-black tracking-wider bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-not-allowed text-center space-y-1"
                >
                  <div>SIGNAL INACHEZA SASA ({prediction.playTime})</div>
                  <div className="text-[10.5px] text-emerald-400/90 font-bold">
                    Muda Uliobaki: {formatSecs(secondsRemainingPlay)}
                  </div>
                </button>
              )
            ) : isSelectedTimeInPast ? (
              <button
                onClick={() => onToast("❌ Mfumo hauruhusiwi kutoa signal ya muda uliopita! Chagua muda ujao.")}
                className="w-full p-4 rounded-xl font-mono text-xs font-black tracking-widest bg-rose-950/50 border border-rose-500/60 text-rose-300 cursor-pointer text-center hover:bg-rose-900/60 transition-all active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              >
                ⚠️ MUDA UMESHAPITA - CHAGUA MUDA UJAO
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isScanning}
                className={`w-full p-4 rounded-xl font-mono text-xs font-black tracking-widest transition-all text-white ${
                  isStars
                    ? 'bg-gradient-to-r from-amber-600 via-[#d36400] to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-[0_4px_20px_rgba(217,119,6,0.35)]'
                    : 'bg-gradient-to-r from-cyan-600 via-[#06b6d4] to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-[0_4px_20px_rgba(6,182,212,0.35)]'
                } cursor-pointer block active:scale-95`}
              >
                GENERATE PREDICTION
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
