export type AppView = 'hub' | 'mines-1' | 'mines-2' | 'mines-3' | 'mines-4';

export type TrapConfig = 3 | 5 | 7;

export interface PredictionData {
  mode: 'mines-1' | 'mines-2' | 'mines-3' | 'mines-4';
  safeTiles: number[];
  trapPositions: number[];
  trapCount: number;
  safeCount: number;
  successRate: string;
  playTime: string;
  playTimestamp: number;
  expiryTimestamp: number;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  riskHeatmap: number[];
  aiAnalysis: {
    patternConfidence: string;
    provablyFairVerified: boolean;
    clusterRisk: string;
    serverLatencyMs: number;
    recommendedCashout: string;
  };
}

export interface ToastState {
  id: number;
  message: string;
  visible: boolean;
}
