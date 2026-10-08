'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Volume2, VolumeX, RotateCcw, Play, Zap, Trophy, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FlappyBirdGameProps {
  betAmount?: number;
  isDemo?: boolean;
  onClose?: () => void;
  onBalanceChange?: () => void;
}

export default function FlappyBirdGame({
  betAmount = 5,
  isDemo = false,
  onClose,
  onBalanceChange
}: FlappyBirdGameProps) {
  const { user, updateBalance, recordBet, setIsDepositOpen } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'cashout' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.0);
  const [pipesPassed, setPipesPassed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cashoutAmount, setCashoutAmount] = useState(0);

  // Sound Synthesizer via Web Audio API
  const playSound = useCallback((type: 'flap' | 'score' | 'cashout' | 'hit') => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'flap') {
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'score') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'cashout') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.1);
        osc.frequency.setValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {}
  }, [soundEnabled]);

  // Game Engine State
  const gameRef = useRef({
    birdY: 250,
    velocity: 0,
    gravity: 0.38,
    jump: -6.8,
    birdX: 80,
    birdSize: 34,
    birdAngle: 0,
    pipes: [] as Array<{ x: number; top: number; bottom: number; passed: boolean }>,
    pipeWidth: 58,
    pipeGap: 140,
    pipeSpeed: 2.5,
    frameCount: 0,
    groundOffset: 0,
    birdImg: null as HTMLImageElement | null,
    animId: 0
  });

  // Load Mascot Image
  useEffect(() => {
    const img = new Image();
    img.src = '/imagens/asset_1.png';
    img.onload = () => {
      gameRef.current.birdImg = img;
    };
  }, []);

  // Multiplier formula based on pipes passed
  const calculateMultiplier = (cleared: number) => {
    if (cleared <= 0) return 1.0;
    // Curva progressiva excitante
    const table: Record<number, number> = {
      1: 1.25,
      2: 1.55,
      3: 1.95,
      4: 2.45,
      5: 3.10,
      6: 4.00,
      7: 5.20,
      8: 7.00,
      9: 9.50,
      10: 13.50,
      12: 25.00,
      15: 50.00,
      20: 100.00
    };
    if (table[cleared]) return table[cleared];
    if (cleared > 20) return Number((100 + (cleared - 20) * 15).toFixed(2));
    return Number((1.0 + cleared * 0.35 + Math.pow(cleared, 1.4) * 0.1).toFixed(2));
  };

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      gameRef.current.velocity = gameRef.current.jump;
      playSound('flap');
    }
  }, [gameState, playSound]);

  const handleStart = async () => {
    // Se for modo real, valida e debita saldo
    if (!isDemo) {
      if (!user) {
        alert('Faça login para jogar valendo prêmios em dinheiro real!');
        return;
      }
      if (user.balance < betAmount) {
        setIsDepositOpen(true);
        return;
      }
      await updateBalance(-betAmount);
      onBalanceChange?.();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset game state
    gameRef.current.birdY = canvas.height * 0.45;
    gameRef.current.velocity = -2;
    gameRef.current.birdAngle = 0;
    gameRef.current.pipes = [
      {
        x: canvas.width + 120,
        top: Math.floor(Math.random() * (canvas.height - 280)) + 60,
        bottom: 0,
        passed: false
      }
    ];
    gameRef.current.frameCount = 0;

    setPipesPassed(0);
    setMultiplier(1.0);
    setCashoutAmount(0);
    setGameState('playing');
    playSound('flap');
  };

  const handleCashout = async () => {
    if (gameState !== 'playing') return;

    const currentMult = calculateMultiplier(pipesPassed);
    const winVal = Number((betAmount * currentMult).toFixed(2));

    setGameState('cashout');
    setCashoutAmount(winVal);
    playSound('cashout');

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 }
      });
    } catch (e) {}

    if (!isDemo) {
      await updateBalance(winVal);
      await recordBet({
        betAmount,
        pipesCleared: pipesPassed,
        multiplier: currentMult,
        wonAmount: winVal,
        result: 'cashout',
        isDemo: false
      });
      onBalanceChange?.();
    } else {
      await recordBet({
        betAmount,
        pipesCleared: pipesPassed,
        multiplier: currentMult,
        wonAmount: winVal,
        result: 'cashout',
        isDemo: true
      });
    }
  };

  const handleCrash = async () => {
    setGameState('crashed');
    playSound('hit');

    if (!isDemo) {
      await recordBet({
        betAmount,
        pipesCleared: pipesPassed,
        multiplier: calculateMultiplier(pipesPassed),
        wonAmount: 0,
        result: 'crashed',
        isDemo: false
      });
      onBalanceChange?.();
    } else {
      await recordBet({
        betAmount,
        pipesCleared: pipesPassed,
        multiplier: calculateMultiplier(pipesPassed),
        wonAmount: 0,
        result: 'crashed',
        isDemo: true
      });
    }
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const g = gameRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const groundH = 46;

      // 1. Clear & Background Gradient (Céu e horizonte verde neon)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#04160b');
      skyGrad.addColorStop(0.65, '#0b2614');
      skyGrad.addColorStop(1, '#050d08');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Stars / Sparks in background
      ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
      for (let i = 0; i < 18; i++) {
        const sx = ((i * 37 + g.frameCount * 0.4) % w);
        const sy = (i * 29) % (h - 100);
        ctx.fillRect(sx, sy, 2, 2);
      }

      // 3. Ground Background
      ctx.fillStyle = '#163820';
      ctx.fillRect(0, h - groundH, w, groundH);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, h - groundH, w, 4);

      // Striped ground movement
      g.groundOffset = (g.groundOffset + (gameState === 'playing' ? g.pipeSpeed : 0.8)) % 24;
      ctx.fillStyle = '#112918';
      for (let gx = -g.groundOffset; gx < w; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, h - groundH + 4);
        ctx.lineTo(gx + 12, h - groundH + 4);
        ctx.lineTo(gx + 6, h);
        ctx.lineTo(gx - 6, h);
        ctx.fill();
      }

      // 4. Update Game Logic if Playing
      if (gameState === 'playing') {
        g.frameCount++;
        g.velocity += g.gravity;
        g.birdY += g.velocity;

        // Angle calculation
        g.birdAngle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (g.velocity * 4) * Math.PI / 180));

        // Ground or ceiling collision
        if (g.birdY + g.birdSize / 2 >= h - groundH) {
          handleCrash();
          return;
        }
        if (g.birdY - g.birdSize / 2 <= 0) {
          g.birdY = g.birdSize / 2;
          g.velocity = 0;
        }

        // Spawn Pipes
        if (g.pipes.length === 0 || g.pipes[g.pipes.length - 1].x < w - 210) {
          const minPipeTop = 60;
          const maxPipeTop = h - groundH - g.pipeGap - 60;
          const topH = Math.floor(Math.random() * (maxPipeTop - minPipeTop)) + minPipeTop;
          g.pipes.push({
            x: w + 20,
            top: topH,
            bottom: h - groundH - topH - g.pipeGap,
            passed: false
          });
        }

        // Move & Check Pipes
        for (let i = 0; i < g.pipes.length; i++) {
          const p = g.pipes[i];
          p.x -= g.pipeSpeed;

          // Check if bird passed pipe
          if (!p.passed && p.x + g.pipeWidth < g.birdX) {
            p.passed = true;
            setPipesPassed((prev) => {
              const next = prev + 1;
              setMultiplier(calculateMultiplier(next));
              playSound('score');
              return next;
            });
          }

          // Pipe Collision Detection
          const birdRadius = g.birdSize * 0.38;
          const inX = g.birdX + birdRadius > p.x && g.birdX - birdRadius < p.x + g.pipeWidth;
          const hitTop = g.birdY - birdRadius < p.top;
          const hitBottom = g.birdY + birdRadius > h - groundH - p.bottom;

          if (inX && (hitTop || hitBottom)) {
            handleCrash();
            return;
          }
        }

        // Remove off-screen pipes
        g.pipes = g.pipes.filter((p) => p.x + g.pipeWidth > -50);
      }

      // 5. Draw Pipes
      g.pipes.forEach((p) => {
        // Top Pipe
        const topGrad = ctx.createLinearGradient(p.x, 0, p.x + g.pipeWidth, 0);
        topGrad.addColorStop(0, '#15803d');
        topGrad.addColorStop(0.35, '#22c55e');
        topGrad.addColorStop(0.8, '#4ade80');
        topGrad.addColorStop(1, '#166534');

        ctx.fillStyle = topGrad;
        ctx.fillRect(p.x, 0, g.pipeWidth, p.top);
        // Pipe Lip
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(p.x - 3, p.top - 20, g.pipeWidth + 6, 20);
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(p.x - 3, p.top - 20, g.pipeWidth + 6, 20);

        // Bottom Pipe
        const bY = h - groundH - p.bottom;
        ctx.fillStyle = topGrad;
        ctx.fillRect(p.x, bY, g.pipeWidth, p.bottom);
        // Bottom Lip
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(p.x - 3, bY, g.pipeWidth + 6, 20);
        ctx.strokeRect(p.x - 3, bY, g.pipeWidth + 6, 20);
      });

      // 6. Draw Bird (Asset_1 sprite with rotation)
      ctx.save();
      ctx.translate(g.birdX, g.birdY);
      ctx.rotate(g.birdAngle);

      if (g.birdImg && g.birdImg.complete) {
        ctx.drawImage(
          g.birdImg,
          -g.birdSize * 0.7,
          -g.birdSize * 0.7,
          g.birdSize * 1.4,
          g.birdSize * 1.4
        );
      } else {
        // Red bird fallback
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, g.birdSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(10, 0, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Loop
      g.animId = requestAnimationFrame(render);
    };

    gameRef.current.animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(gameRef.current.animId);
    };
  }, [gameState, handleCrash, playSound]);

  // Keyboard controls (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'idle') handleStart();
        else if (gameState === 'playing') jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump]);

  const currentMultiplier = calculateMultiplier(pipesPassed);
  const potentialWin = Number((betAmount * currentMultiplier).toFixed(2));

  return (
    <div className="relative w-full max-w-lg mx-auto bg-[#050d08] border border-[#22c55e]/30 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none">
      {/* Top HUD */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-black/60 border border-[#22c55e]/40 backdrop-blur-md">
            <span className="text-[10px] text-[#8fae9e] font-extrabold uppercase block leading-none">
              Aposta {isDemo ? '(DEMO)' : ''}
            </span>
            <span className="text-sm font-black text-white">
              R$ {betAmount.toFixed(2)}
            </span>
          </div>

          <div className="px-3 py-1 rounded-full bg-black/60 border border-[#f7c948]/40 backdrop-blur-md">
            <span className="text-[10px] text-[#8fae9e] font-extrabold uppercase block leading-none">
              Canos
            </span>
            <span className="text-sm font-black text-[#f7c948]">
              {pipesPassed}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full bg-black/60 border border-white/10 text-white/80 hover:text-white transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 border border-white/10 text-white/80 hover:text-white transition text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Realtime Multiplier Display in Playing mode */}
      {gameState === 'playing' && (
        <div className="absolute top-16 inset-x-0 z-20 flex flex-col items-center pointer-events-none">
          <div className="px-5 py-1.5 rounded-2xl bg-black/70 border border-[#22c55e] shadow-[0_0_25px_rgba(34,197,94,0.5)] backdrop-blur-md text-center animate-pulse">
            <span className="text-3xl sm:text-4xl font-black text-[#f7c948] tracking-tight block">
              {currentMultiplier.toFixed(2)}x
            </span>
            <span className="text-xs font-black text-[#22c55e] uppercase tracking-wider block">
              Acumulado: R$ {potentialWin.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={420}
        height={540}
        onClick={jump}
        className="w-full h-[520px] sm:h-[560px] block cursor-pointer bg-[#050d08]"
      />

      {/* OVERLAY: IDLE (Pronto para voar) */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/70 backdrop-blur-sm text-center">
          <div className="w-24 h-24 mb-3 animate-voa">
            <img src="/imagens/asset_1.png" alt="Mascote" className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            PRONTO PARA <span className="text-[#22c55e]">VOAR?</span>
          </h3>
          <p className="text-xs text-[#cfe3d7] max-w-xs mt-1 mb-6">
            Toque na tela para bater as asas. Desvie dos canos e faça o cashout antes de bater!
          </p>

          <button
            onClick={handleStart}
            className="w-full max-w-xs py-4 px-8 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_10px_35px_rgba(34,197,94,0.7)] uppercase tracking-wider text-base transition flex items-center justify-center gap-2 animate-ctapulse"
          >
            <Play className="w-5 h-5 fill-black" />
            {isDemo ? 'JOGAR MODO DEMO' : `INICIAR VOO (R$ ${betAmount.toFixed(2)})`}
          </button>
        </div>
      )}

      {/* OVERLAY: CASHOUT (Vitória com asset_5) */}
      {gameState === 'cashout' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-md text-center animate-fadeIn">
          <div className="w-36 h-28 mb-2 overflow-hidden rounded-2xl border-2 border-[#f7c948] shadow-[0_0_30px_rgba(247,201,72,0.6)]">
            <img src="/imagens/asset_5.webp" alt="Jackpot" className="w-full h-full object-cover" />
          </div>
          <div className="inline-flex items-center gap-1 text-[#f7c948] text-xs font-black uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4" /> CASHOUT REALIZADO COM SUCESSO!
          </div>
          <h2 className="text-4xl font-black text-[#22c55e] mb-1">
            +R$ {cashoutAmount.toFixed(2)}
          </h2>
          <p className="text-xs text-[#8fae9e] mb-6">
            Multiplicador alcançado: <b className="text-white">{multiplier.toFixed(2)}x</b> ({pipesPassed} canos)
          </p>

          <button
            onClick={handleStart}
            className="w-full max-w-xs py-3.5 px-6 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_8px_25px_rgba(34,197,94,0.6)] uppercase tracking-wider text-sm transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            VOAR NOVAMENTE
          </button>
        </div>
      )}

      {/* OVERLAY: CRASHED (Bateu no cano com asset_4) */}
      {gameState === 'crashed' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-md text-center animate-fadeIn">
          <div className="w-32 h-24 mb-3 overflow-hidden rounded-2xl border-2 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
            <img src="/imagens/asset_4.webp" alt="Bateu no cano" className="w-full h-full object-cover" />
          </div>
          <div className="inline-flex items-center gap-1 text-red-400 text-xs font-black uppercase tracking-widest mb-1">
            <ShieldAlert className="w-4 h-4" /> VOCÊ BATEU NO CANO!
          </div>
          <h2 className="text-2xl font-black text-white mb-1 uppercase">
            QUASE LÁ!
          </h2>
          <p className="text-xs text-[#8fae9e] mb-6">
            Você ultrapassou {pipesPassed} canos e chegou a {multiplier.toFixed(2)}x antes de colidir.
          </p>

          <button
            onClick={handleStart}
            className="w-full max-w-xs py-3.5 px-6 rounded-full font-black text-black bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 shadow-[0_8px_25px_rgba(34,197,94,0.6)] uppercase tracking-wider text-sm transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            TENTAR DE NOVO
          </button>
        </div>
      )}

      {/* BOTTOM CONTROLS: Botão CASHOUT fixo durante o jogo */}
      {gameState === 'playing' && (
        <div className="absolute bottom-5 inset-x-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCashout();
            }}
            className="w-full py-4 px-6 rounded-full font-black text-black bg-gradient-to-r from-[#f7c948] via-[#22c55e] to-[#f7c948] shadow-[0_0_35px_rgba(34,197,94,0.9)] uppercase tracking-wider text-base transition flex items-center justify-center gap-2 animate-ctapulse active:scale-95"
          >
            <Zap className="w-5 h-5 fill-black" />
            SACAR GANHOS: R$ {potentialWin.toFixed(2)} ({currentMultiplier.toFixed(2)}x)
          </button>
        </div>
      )}
    </div>
  );
}
