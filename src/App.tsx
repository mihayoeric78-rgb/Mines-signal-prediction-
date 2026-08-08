import React, { useState, useEffect } from 'react';
import { AppView, PredictionData } from './types';
import { MatrixCanvas } from './components/MatrixCanvas';
import { Toast } from './components/Toast';
import { HubView } from './components/HubView';
import { MinesView } from './components/MinesView';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('hub');
  const [toastMessage, setToastMessage] = useState<string | null>("System ready");
  const [predictionMines1, setPredictionMines1] = useState<PredictionData | null>(null);
  const [predictionMines2, setPredictionMines2] = useState<PredictionData | null>(null);
  const [predictionMines3, setPredictionMines3] = useState<PredictionData | null>(null);
  const [predictionMines4, setPredictionMines4] = useState<PredictionData | null>(null);

  // Load active predictions from localStorage on initial render
  useEffect(() => {
    try {
      const saved1 = localStorage.getItem('pred_mines-1');
      if (saved1) {
        const parsed = JSON.parse(saved1);
        if (parsed && parsed.expiryTimestamp > Date.now()) {
          setPredictionMines1(parsed);
        } else {
          localStorage.removeItem('pred_mines-1');
        }
      }

      const saved2 = localStorage.getItem('pred_mines-2');
      if (saved2) {
        const parsed = JSON.parse(saved2);
        if (parsed && parsed.expiryTimestamp > Date.now()) {
          setPredictionMines2(parsed);
        } else {
          localStorage.removeItem('pred_mines-2');
        }
      }

      const saved3 = localStorage.getItem('pred_mines-3');
      if (saved3) {
        const parsed = JSON.parse(saved3);
        if (parsed && parsed.expiryTimestamp > Date.now()) {
          setPredictionMines3(parsed);
        } else {
          localStorage.removeItem('pred_mines-3');
        }
      }

      const saved4 = localStorage.getItem('pred_mines-4');
      if (saved4) {
        const parsed = JSON.parse(saved4);
        if (parsed && parsed.expiryTimestamp > Date.now()) {
          setPredictionMines4(parsed);
        } else {
          localStorage.removeItem('pred_mines-4');
        }
      }
    } catch {
      // Ignore JSON parse error
    }
  }, []);

  // Update handlers with localStorage persistence
  const handleSetPredictionMines1 = (pred: PredictionData | null) => {
    setPredictionMines1(pred);
    if (pred) {
      localStorage.setItem('pred_mines-1', JSON.stringify(pred));
    } else {
      localStorage.removeItem('pred_mines-1');
    }
  };

  const handleSetPredictionMines2 = (pred: PredictionData | null) => {
    setPredictionMines2(pred);
    if (pred) {
      localStorage.setItem('pred_mines-2', JSON.stringify(pred));
    } else {
      localStorage.removeItem('pred_mines-2');
    }
  };

  const handleSetPredictionMines3 = (pred: PredictionData | null) => {
    setPredictionMines3(pred);
    if (pred) {
      localStorage.setItem('pred_mines-3', JSON.stringify(pred));
    } else {
      localStorage.removeItem('pred_mines-3');
    }
  };

  const handleSetPredictionMines4 = (pred: PredictionData | null) => {
    setPredictionMines4(pred);
    if (pred) {
      localStorage.setItem('pred_mines-4', JSON.stringify(pred));
    } else {
      localStorage.removeItem('pred_mines-4');
    }
  };

  const handleSwitchView = (view: AppView) => {
    setActiveView(view);
    if (view === 'hub') {
      setToastMessage("Back to main menu");
    } else if (view === 'mines-1') {
      setToastMessage("Stars Mode");
    } else if (view === 'mines-2') {
      setToastMessage("Bombs Mode");
    } else if (view === 'mines-3') {
      setToastMessage("Mines ya Nyota 7x7 Mode");
    } else if (view === 'mines-4') {
      setToastMessage("Mines ya Mabomu 7x7 Mode");
    }
  };

  return (
    <div className="min-h-screen bg-[#030612] text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Matrix Canvas Animation */}
      <MatrixCanvas />

      {/* Top Header */}
      <header className="w-full text-center py-4 px-4 relative z-20 border-b border-slate-800/80 bg-[#060a17]/95 backdrop-blur-md shadow-lg">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-sans italic tracking-wider bg-gradient-to-r from-amber-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent uppercase drop-shadow-[0_2px_12px_rgba(34,211,238,0.35)]">
            MINES PREDICTION SIGNAL PRO
          </h1>
          {/* Yellow to Cyan Gradient Line Bar from image */}
          <div className="w-36 sm:w-48 h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
        </div>
      </header>

      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/4 w-[320px] h-[320px] bg-amber-500/5 rounded-full pointer-events-none blur-[110px] z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-500/5 rounded-full pointer-events-none blur-[120px] z-0" />

      {/* Toast Notification Container */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Main View Area */}
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-6 relative z-10 flex items-center justify-center">
        {activeView === 'hub' && (
          <HubView
            onSwitchView={handleSwitchView}
            onToast={(msg) => setToastMessage(msg)}
          />
        )}

        {activeView === 'mines-1' && (
          <MinesView
            mode="mines-1"
            prediction={predictionMines1}
            onSetPrediction={handleSetPredictionMines1}
            onBack={() => handleSwitchView('hub')}
            onToast={(msg) => setToastMessage(msg)}
          />
        )}

        {activeView === 'mines-2' && (
          <MinesView
            mode="mines-2"
            prediction={predictionMines2}
            onSetPrediction={handleSetPredictionMines2}
            onBack={() => handleSwitchView('hub')}
            onToast={(msg) => setToastMessage(msg)}
          />
        )}

        {activeView === 'mines-3' && (
          <MinesView
            mode="mines-3"
            prediction={predictionMines3}
            onSetPrediction={handleSetPredictionMines3}
            onBack={() => handleSwitchView('hub')}
            onToast={(msg) => setToastMessage(msg)}
          />
        )}

        {activeView === 'mines-4' && (
          <MinesView
            mode="mines-4"
            prediction={predictionMines4}
            onSetPrediction={handleSetPredictionMines4}
            onBack={() => handleSwitchView('hub')}
            onToast={(msg) => setToastMessage(msg)}
          />
        )}
      </main>
    </div>
  );
}
