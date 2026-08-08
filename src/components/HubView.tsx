import React from 'react';
import { HelpCircle } from 'lucide-react';
import { AppView } from '../types';
import starModeImg from '../assets/images/mines_star_mode_cover_1786120546252.jpg';
import bombsModeImg from '../assets/images/mines_bombs_mode_cover_1786120556933.jpg';
import star7x7Img from '../assets/images/mines_star_7x7_cover_1786121713872.jpg';
import bomb7x7Img from '../assets/images/mines_bomb_7x7_cover_1786121729408.jpg';

interface HubViewProps {
  onSwitchView: (view: AppView) => void;
  onToast: (msg: string) => void;
}

export const HubView: React.FC<HubViewProps> = ({ onSwitchView }) => {
  return (
    <div className="max-w-lg w-full mx-auto flex flex-col space-y-6 transition-all duration-300">
      {/* 4 Mines Game Modes Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Mode 1: Stars Mode */}
        <button
          onClick={() => onSwitchView('mines-1')}
          className="relative aspect-[4/5] sm:aspect-square w-full rounded-[24px] sm:rounded-[28px] border-2 border-amber-400/80 bg-[#0b101f] overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.6)] group hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer p-0"
        >
          <img
            src={starModeImg}
            alt="Mines Star Mode"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </button>

        {/* Mode 2: Bombs Mode */}
        <button
          onClick={() => onSwitchView('mines-2')}
          className="relative aspect-[4/5] sm:aspect-square w-full rounded-[24px] sm:rounded-[28px] border-2 border-cyan-400/80 bg-[#0b101f] overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.8)] group hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer p-0"
        >
          <img
            src={bombsModeImg}
            alt="Mines Bombs Mode"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </button>

        {/* Mode 3: Stars Mode 7x7 (7 Safe / 7 Traps) */}
        <button
          onClick={() => onSwitchView('mines-3')}
          className="relative aspect-[4/5] sm:aspect-square w-full rounded-[24px] sm:rounded-[28px] border-2 border-yellow-400/80 bg-[#0b101f] overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.7)] group hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer p-0"
        >
          <img
            src={star7x7Img}
            alt="Mines Star 7x7 Mode"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </button>

        {/* Mode 4: Bombs Mode 7x7 (7 Safe / 7 Bombs) */}
        <button
          onClick={() => onSwitchView('mines-4')}
          className="relative aspect-[4/5] sm:aspect-square w-full rounded-[24px] sm:rounded-[28px] border-2 border-blue-400/80 bg-[#0b101f] overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.8)] group hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer p-0"
        >
          <img
            src={bomb7x7Img}
            alt="Mines Bomb 7x7 Mode"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </button>
      </div>

      {/* Tutorial Guide */}
      <div className="bg-[#09101f]/95 border border-amber-500/25 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center space-x-2.5 text-amber-400 font-bold font-mono border-b border-amber-500/10 pb-2">
          <HelpCircle className="w-4.5 h-4.5 text-amber-400 font-bold" />
          <span className="text-[11.5px] uppercase tracking-wide">AIPRO777 SYNCHRONIZATION GUIDE</span>
        </div>
        <div className="space-y-3 font-medium text-left">
          <div>
            <p className="text-white text-[12px] font-black uppercase mb-1">
              AUTHENTIC GAME IDENTIFICATION:
            </p>
            <p className="text-[11px] leading-relaxed text-slate-300">
              The official game is <strong className="text-amber-400">MINES</strong> in{" "}
              <strong className="text-amber-400">1WIN games</strong>. Features bomb and star symbols with 5x5 grid.
            </p>
          </div>
          <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/15 space-y-2">
            <p className="text-amber-400 text-[11.5px] font-black uppercase">
              REGISTRATION & SYNCHRONIZATION:
            </p>
            <p className="text-[11px] leading-relaxed text-slate-300">
              To synchronize Python AI Engine with 1win server algorithms:
            </p>
            <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1.5 ml-1">
              <li>Visit 1win website/app</li>
              <li>Click Registration</li>
              <li>Enter phone, email, password</li>
              <li>Find Add Promo Code</li>
              <li>
                Enter:{" "}
                <strong className="text-amber-400 font-mono text-[12px] font-black select-all">
                  AIPRO777
                </strong>
              </li>
              <li>Complete registration</li>
            </ol>
            <p className="text-[9.5px] text-amber-500/90 font-mono leading-tight mt-1">
              *Promo Code AIPRO777 is mandatory for synchronization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
