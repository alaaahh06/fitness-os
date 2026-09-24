import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Home, Dumbbell, History, User, Play, Zap, Target, Square, CheckCircle, Plus, X, Timer } from 'lucide-react';
import { supabase } from './lib/supabase';

// --- WORKOUT LIBRARIES ---
const WORKOUT_LIBRARIES: Record<string, any[]> = {
  'Push / Pull / Legs': [
    { dayName: 'Push Day', exercises: [ { name: 'Bench Press', sets: 3, reps: '8-12' }, { name: 'Incline Dumbbell Press', sets: 3, reps: '8-12' }, { name: 'Overhead Press', sets: 3, reps: '8-12' }, { name: 'Triceps Pushdown', sets: 3, reps: '10-15' } ] },
    { dayName: 'Pull Day', exercises: [ { name: 'Lat Pulldown', sets: 3, reps: '8-12' }, { name: 'Barbell Row', sets: 3, reps: '8-12' }, { name: 'Face Pulls', sets: 3, reps: '12-15' }, { name: 'Bicep Curls', sets: 3, reps: '10-15' } ] },
    { dayName: 'Leg Day', exercises: [ { name: 'Barbell Squat', sets: 3, reps: '5-8' }, { name: 'Leg Press', sets: 3, reps: '10-15' }, { name: 'Leg Curls', sets: 3, reps: '10-15' }, { name: 'Calf Raises', sets: 4, reps: '15-20' } ] }
  ],
  'Upper / Lower': [
    { dayName: 'Upper Body', exercises: [ { name: 'Bench Press', sets: 3, reps: '8-12' }, { name: 'Barbell Row', sets: 3, reps: '8-12' }, { name: 'Overhead Press', sets: 3, reps: '8-12' }, { name: 'Lat Pulldown', sets: 3, reps: '8-12' } ] },
    { dayName: 'Lower Body', exercises: [ { name: 'Barbell Squat', sets: 3, reps: '5-8' }, { name: 'Romanian Deadlift', sets: 3, reps: '8-12' }, { name: 'Leg Press', sets: 3, reps: '10-15' }, { name: 'Calf Raises', sets: 4, reps: '15-20' } ] }
  ],
  'Full Body': [
    { dayName: 'Full Body A', exercises: [ { name: 'Barbell Squat', sets: 3, reps: '5-8' }, { name: 'Bench Press', sets: 3, reps: '8-12' }, { name: 'Barbell Row', sets: 3, reps: '8-12' }, { name: 'Bicep Curls', sets: 2, reps: '10-15' } ] },
    { dayName: 'Full Body B', exercises: [ { name: 'Deadlift', sets: 3, reps: '5-8' }, { name: 'Overhead Press', sets: 3, reps: '8-12' }, { name: 'Lat Pulldown', sets: 3, reps: '8-12' }, { name: 'Triceps Pushdown', sets: 2, reps: '10-15' } ] }
  ],
  'Bro Split': [
    { dayName: 'Chest Day', exercises: [ { name: 'Bench Press', sets: 4, reps: '8-12' }, { name: 'Incline DB Press', sets: 3, reps: '8-12' }, { name: 'Cable Crossovers', sets: 3, reps: '12-15' } ] },
    { dayName: 'Back Day', exercises: [ { name: 'Deadlift', sets: 3, reps: '5-8' }, { name: 'Lat Pulldown', sets: 3, reps: '8-12' }, { name: 'Seated Cable Row', sets: 3, reps: '10-12' } ] },
    { dayName: 'Leg Day', exercises: [ { name: 'Barbell Squat', sets: 4, reps: '5-8' }, { name: 'Leg Press', sets: 3, reps: '10-15' }, { name: 'Leg Extensions', sets: 3, reps: '12-15' } ] },
    { dayName: 'Shoulder Day', exercises: [ { name: 'Overhead Press', sets: 4, reps: '8-12' }, { name: 'Lateral Raises', sets: 4, reps: '12-15' }, { name: 'Front Raises', sets: 3, reps: '12-15' } ] },
    { dayName: 'Arm Day', exercises: [ { name: 'Barbell Curls', sets: 3, reps: '10-15' }, { name: 'Triceps Extension', sets: 3, reps: '10-15' }, { name: 'Hammer Curls', sets: 3, reps: '10-15' } ] }
  ]
};

// --- AUTHENTICATION SCREEN ---
const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tight">FITNESS OS</h1>
        <p className="text-textMuted uppercase tracking-widest text-xs font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</p>
      </div>
      
      <div className="space-y-4 bg-surface p-6 rounded-2xl border border-border shadow-lg">
        {error && <div className="p-3 bg-[#1a1515] border border-red-900/50 text-red-200 text-sm rounded-lg">{error}</div>}
        <div>
          <label className="text-xs uppercase font-bold text-textMuted tracking-wider mb-2 block">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 font-bold focus:border-textMain focus:outline-none focus:ring-1 focus:ring-textMain" />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-textMuted tracking-wider mb-2 block">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 font-bold focus:border-textMain focus:outline-none focus:ring-1 focus:ring-textMain" />
        </div>
        <button onClick={handleAuth} className="w-full py-4 mt-2 bg-textMain text-background font-black text-lg rounded-xl hover:opacity-90 transition-all">
          {isLogin ? 'LOG IN' : 'SIGN UP'}
        </button>
      </div>
      <button onClick={() => setIsLogin(!isLogin)} className="text-textMuted text-sm font-bold w-full text-center hover:text-textMain transition-colors">
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
      </button>
    </div>
  );
};

// --- SETUP / ONBOARDING COMPONENT ---
const Setup = ({ userId, onComplete }: { userId: string, onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [split, setSplit] = useState('');
  const [customPlan, setCustomPlan] = useState([{ name: '', sets: 3, reps: '8-12' }]);

  const saveProfile = async (selectedSplit: string, planData: any = null) => {
    await supabase.from('profiles').upsert({
      id: userId,
      name: name,
      split_preference: selectedSplit,
      custom_plan: planData,
      current_day_index: 0
    });
    onComplete();
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center p-6 space-y-8 animate-fade-in">
        <h2 className="text-3xl font-black tracking-tight uppercase">What should we call you?</h2>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arju" className="w-full bg-surface border border-border rounded-xl p-6 text-2xl font-bold focus:outline-none focus:border-textMain" />
        <button onClick={() => name.trim() && setStep(2)} className={`w-full py-5 font-black text-lg rounded-xl transition-all ${name.trim() ? 'bg-textMain text-background hover:opacity-90' : 'bg-surface text-textMuted pointer-events-none'}`}>CONTINUE</button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6 space-y-6 animate-fade-in pb-24 overflow-y-auto">
        <div className="space-y-2 mt-8">
          <h2 className="text-3xl font-black tracking-tight uppercase">Build Custom Routine</h2>
        </div>
        <div className="space-y-4">
          {customPlan.map((ex, idx) => (
            <div key={idx} className="bg-surface p-4 rounded-xl border border-border space-y-3 relative shadow-sm">
              {customPlan.length > 1 && <button onClick={() => setCustomPlan(customPlan.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-textMuted hover:text-red-500"><X className="w-5 h-5" /></button>}
              <input type="text" value={ex.name} onChange={(e) => { const newPlan = [...customPlan]; newPlan[idx].name = e.target.value; setCustomPlan(newPlan); }} placeholder="Exercise" className="w-full bg-background border border-border rounded-lg p-3 font-bold focus:border-textMain focus:outline-none" />
              <div className="flex gap-3">
                <div className="flex-1"><label className="text-[10px] uppercase font-bold text-textMuted tracking-wider mb-1 block">Sets</label><input type="number" value={ex.sets} onChange={(e) => { const newPlan = [...customPlan]; newPlan[idx].sets = Number(e.target.value); setCustomPlan(newPlan); }} className="w-full bg-background border border-border rounded-lg p-3 focus:border-textMain focus:outline-none" /></div>
                <div className="flex-1"><label className="text-[10px] uppercase font-bold text-textMuted tracking-wider mb-1 block">Reps</label><input type="text" value={ex.reps} onChange={(e) => { const newPlan = [...customPlan]; newPlan[idx].reps = e.target.value; setCustomPlan(newPlan); }} className="w-full bg-background border border-border rounded-lg p-3 focus:border-textMain focus:outline-none" /></div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setCustomPlan([...customPlan, { name: '', sets: 3, reps: '8-12' }])} className="w-full py-4 border border-dashed border-textMuted text-textMuted font-bold rounded-xl hover:text-textMain hover:border-textMain flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> ADD EXERCISE</button>
        <button onClick={() => { const finalPlan = customPlan.filter(ex => ex.name.trim() !== ''); if (finalPlan.length > 0) saveProfile('Custom', [{ dayName: 'Custom Workout', exercises: finalPlan }]); }} className="w-full py-5 font-black text-lg rounded-xl bg-textMain text-background hover:opacity-90 shadow-lg mt-4">SAVE WORKOUT</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">Choose your split</h2>
      </div>
      <div className="space-y-3">
        {['Push / Pull / Legs', 'Upper / Lower', 'Full Body', 'Bro Split', 'Custom'].map((s) => (
          <button key={s} onClick={() => setSplit(s)} className={`w-full p-6 rounded-xl border text-left text-xl font-bold transition-all ${split === s ? 'bg-textMain text-background border-textMain' : 'bg-surface border-border text-textMain'}`}>{s}</button>
        ))}
      </div>
      <button onClick={() => split === 'Custom' ? setStep(3) : saveProfile(split)} className={`w-full py-5 font-black text-lg rounded-xl transition-all ${split ? 'bg-textMain text-background hover:opacity-90' : 'bg-surface text-textMuted pointer-events-none'}`}>
        {split === 'Custom' ? 'BUILD ROUTINE →' : 'FINISH SETUP'}
      </button>
    </div>
  );
};

// --- DASHBOARD COMPONENT ---
const Dashboard = ({ profile }: { profile: any }) => {
  const navigate = useNavigate();

  let userSplit = [];
  if (profile.split_preference === 'Custom') {
    userSplit = profile.custom_plan || [];
  } else {
    userSplit = WORKOUT_LIBRARIES[profile.split_preference] || [];
  }

  const todaysRoutine = userSplit[profile.current_day_index] || { dayName: 'Workout', exercises: [] };
  const todaysPlan = todaysRoutine.exercises;

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-24">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Good evening, {profile.name}</h1>
        <p className="text-textMuted mt-1">Ready to crush your goals?</p>
      </header>

      <section>
        <h2 className="text-xs font-bold text-textMuted uppercase tracking-widest mb-4">Today's Training</h2>
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-2xl font-black italic tracking-tight mb-6 uppercase">{todaysRoutine.dayName}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background rounded-xl p-4 border border-border flex flex-col justify-between">
              <Target className="w-5 h-5 text-textMuted mb-2" />
              <div>
                <p className="text-2xl font-bold">{todaysPlan.reduce((acc: number, curr: any) => acc + curr.sets, 0)}</p>
                <p className="text-xs text-textMuted uppercase tracking-wider mt-1">Sets Today</p>
              </div>
            </div>
            <div className="bg-background rounded-xl p-4 border border-border flex flex-col justify-between">
              <Zap className="w-5 h-5 text-textMuted mb-2" />
              <div>
                <p className="text-xl font-bold">{profile.split_preference}</p>
                <p className="text-xs text-textMuted uppercase tracking-wider mt-1">Current Split</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-textMuted uppercase tracking-widest mb-4">Today's Exercises</h2>
        <div className="space-y-3">
          {todaysPlan.map((ex: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-4 bg-surface border border-border rounded-xl">
              <span className="font-medium text-lg">{ex.name}</span>
              <span className="text-sm text-textMuted font-mono bg-background px-3 py-1 rounded-lg border border-border">{ex.sets} × {ex.reps}</span>
            </div>
          ))}
        </div>
      </section>

      <button onClick={() => navigate('/workout', { state: { todaysRoutine, splitLength: userSplit.length } })} className="w-full py-5 bg-textMain text-background font-black text-lg rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
        <Play className="w-6 h-6 fill-background" /> START WORKOUT
      </button>
    </div>
  );
};

// --- WORKOUT COMPONENT ---
const Workout = ({ userId }: { userId: string }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const todaysRoutine = location.state?.todaysRoutine || { dayName: 'Workout', exercises: [] };
  const splitLength = location.state?.splitLength || 1;
  const plan = todaysRoutine.exercises;

  const [energy, setEnergy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [volume, setVolume] = useState(0);
  const [setsCompleted, setSetsCompleted] = useState(0);
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentReps, setCurrentReps] = useState('');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTracking) interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isTracking]);

  const workoutPlan = plan.map((ex: any) => {
    let adjustedSets = ex.sets;
    if (energy && energy <= 2) adjustedSets = Math.max(1, ex.sets - 1);
    return { name: ex.name, target: `${adjustedSets} × ${ex.reps}` };
  });

  const activeExercise = workoutPlan[currentExerciseIndex];

  // Auto-fill suggested weight from Local Storage
  useEffect(() => {
    if (activeExercise) {
      const memory = JSON.parse(localStorage.getItem('fitnessOsWeights') || '{}');
      if (memory[activeExercise.name]) {
        setCurrentWeight(memory[activeExercise.name]);
      } else {
        setCurrentWeight('');
      }
      setCurrentReps('');
    }
  }, [currentExerciseIndex, activeExercise]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!energy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 space-y-10 animate-fade-in pb-24">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">HOW ARE YOU FEELING?</h2>
          <p className="text-textMuted text-sm">This adjusts today's volume.</p>
        </div>
        <div className="flex w-full gap-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <button key={level} onClick={() => setEnergy(level)} className="flex-1 aspect-square rounded-2xl text-2xl font-black bg-surface border border-border text-textMuted hover:border-textMain focus:bg-textMain focus:text-background transition-all">{level}</button>
          ))}
        </div>
      </div>
    );
  }

  const handleCompleteSet = () => {
    const w = Number(currentWeight);
    const r = Number(currentReps);
    if (w > 0 && r > 0) {
      // Save weight to memory for next time
      const memory = JSON.parse(localStorage.getItem('fitnessOsWeights') || '{}');
      memory[activeExercise.name] = currentWeight;
      localStorage.setItem('fitnessOsWeights', JSON.stringify(memory));

      setVolume(prev => prev + (w * r));
      setSetsCompleted(prev => prev + 1);
      setCurrentReps('');
    }
  };

  const handleFinish = async () => {
    setIsTracking(false);
    
    await supabase.from('workout_logs').insert({
      user_id: userId,
      day_name: todaysRoutine.dayName,
      energy_level: energy,
      total_volume: volume,
      duration_seconds: elapsedTime,
      sets_completed: setsCompleted
    });

    const { data: profile } = await supabase.from('profiles').select('current_day_index').eq('id', userId).single();
    if (profile) {
      const nextDay = (profile.current_day_index + 1) % splitLength;
      await supabase.from('profiles').update({ current_day_index: nextDay }).eq('id', userId);
    }

    navigate('/summary', { state: { finalVolume: volume, finalSeconds: elapsedTime, finalSets: setsCompleted, energyLevel: energy } });
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-32">
      <div className="flex justify-between items-center pb-4 border-b border-border mt-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight italic uppercase">{todaysRoutine.dayName}</h1>
          <p className="text-textMuted text-sm flex items-center gap-1 mt-1"><Zap className="w-3 h-3" /> Energy: {energy}/5</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-mono font-bold tracking-widest ${isTracking ? 'text-textMain' : 'text-textMuted'}`}>{formatTime(elapsedTime)}</div>
        </div>
      </div>

      {!isTracking ? (
        <div className="py-12 flex flex-col items-center space-y-4">
          <Timer className="w-16 h-16 text-textMuted" />
          <p className="text-textMuted font-medium">Ready when you are.</p>
          <button onClick={() => setIsTracking(true)} className="w-full py-5 mt-4 bg-textMain text-background font-black text-xl rounded-xl hover:opacity-90 transition-all shadow-lg shadow-white/10">START TRACKING</button>
        </div>
      ) : (
        <>
          <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col items-center shadow-sm">
            <p className="text-textMuted text-xs font-bold tracking-widest uppercase mb-2">Live Volume</p>
            <p className="text-5xl font-black">{volume.toLocaleString()} <span className="text-xl text-textMuted font-normal">kg</span></p>
          </div>
          <div className="bg-surface p-6 rounded-2xl border border-border space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-xl uppercase tracking-wide">{activeExercise?.name}</h3>
               <span className="text-sm text-textMuted font-mono bg-background px-3 py-1 rounded-lg border border-border">{activeExercise?.target}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-textMuted text-xs font-bold uppercase tracking-wider mb-2 block">Weight (kg)</label>
                <input type="number" inputMode="decimal" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-3xl font-black text-center focus:outline-none focus:border-textMain" />
              </div>
              <div className="flex-1">
                <label className="text-textMuted text-xs font-bold uppercase tracking-wider mb-2 block">Reps</label>
                <input type="number" inputMode="numeric" value={currentReps} onChange={(e) => setCurrentReps(e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-3xl font-black text-center focus:outline-none focus:border-textMain" />
              </div>
            </div>
            <button onClick={handleCompleteSet} className="w-full py-5 bg-textMain text-background font-black text-lg rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              <CheckCircle className="w-6 h-6" /> COMPLETE SET
            </button>
            {currentExerciseIndex < workoutPlan.length - 1 && (
              <button onClick={() => setCurrentExerciseIndex(prev => prev + 1)} className="w-full py-4 bg-transparent border border-border text-textMain font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-surface transition-colors mt-2">NEXT EXERCISE →</button>
            )}
          </div>
        </>
      )}

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent pointer-events-none">
        <button onClick={handleFinish} className="w-full py-4 bg-surface border border-border text-textMain font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-border transition-colors pointer-events-auto shadow-lg">
          <Square className="w-5 h-5 fill-textMain" /> FINISH WORKOUT
        </button>
      </div>
    </div>
  );
};

// --- WORKOUT SUMMARY COMPONENT ---
const WorkoutSummary = ({ refreshProfile }: { refreshProfile: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const stats = location.state || { finalVolume: 0, finalSeconds: 0, finalSets: 0, energyLevel: 3 };
  const minutes = Math.ceil(stats.finalSeconds / 60);

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-24">
      <div className="text-center space-y-2 mt-8">
        <h1 className="text-4xl font-black tracking-tight uppercase italic">Workout Complete</h1>
        <p className="text-textMuted text-sm">Session saved to database.</p>
      </div>
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-textMuted text-xs font-bold uppercase tracking-wider mb-1">Volume</p><p className="text-2xl font-bold">{stats.finalVolume.toLocaleString()} <span className="text-sm font-normal text-textMuted">kg</span></p></div>
          <div><p className="text-textMuted text-xs font-bold uppercase tracking-wider mb-1">Duration</p><p className="text-2xl font-bold">{minutes} <span className="text-sm font-normal text-textMuted">min</span></p></div>
          <div><p className="text-textMuted text-xs font-bold uppercase tracking-wider mb-1">Sets</p><p className="text-2xl font-bold">{stats.finalSets}</p></div>
          <div><p className="text-textMuted text-xs font-bold uppercase tracking-wider mb-1">Energy</p><p className="text-2xl font-bold text-textMain">{stats.energyLevel} / 5</p></div>
        </div>
      </div>
      <button 
        onClick={() => { refreshProfile(); navigate('/'); }}
        className="w-full py-5 bg-textMain text-background font-black text-lg rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all mt-8"
      >
        <CheckCircle className="w-6 h-6" /> DONE
      </button>
    </div>
  );
};

// --- HISTORY SCREEN ---
const HistoryScreen = ({ userId }: { userId: string }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setLogs(data || []);
    setLoading(false);
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to permanently delete all your workout history?")) {
      await supabase.from('workout_logs').delete().eq('user_id', userId);
      setLogs([]);
    }
  };

  if (loading) return <div className="p-6 text-textMuted font-bold mt-8">LOADING HISTORY...</div>;

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-24 mt-4">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-black tracking-tight uppercase italic">History</h1>
        {logs.length > 0 && (
          <button onClick={handleClear} className="text-red-500 font-bold uppercase text-xs tracking-wider mb-1 hover:text-red-400">Clear All</button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="bg-surface p-6 rounded-2xl border border-border text-center text-textMuted shadow-sm">
          No workouts logged yet. Time to get to work!
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-surface p-4 rounded-xl border border-border shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg uppercase">{log.day_name}</h3>
                <span className="text-xs text-textMuted font-bold">{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div><span className="text-textMuted uppercase text-[10px] tracking-wider block mb-1">Volume</span> <span className="font-bold">{log.total_volume}kg</span></div>
                <div><span className="text-textMuted uppercase text-[10px] tracking-wider block mb-1">Sets</span> <span className="font-bold">{log.sets_completed}</span></div>
                <div><span className="text-textMuted uppercase text-[10px] tracking-wider block mb-1">Time</span> <span className="font-bold">{Math.ceil(log.duration_seconds/60)}m</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- PROFILE SCREEN ---
const ProfileScreen = ({ profile, refreshProfile }: { profile: any, refreshProfile: () => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSplit, setNewSplit] = useState(profile.split_preference);

  const handleSave = async () => {
    await supabase.from('profiles').update({ 
      split_preference: newSplit,
      current_day_index: 0 
    }).eq('id', profile.id);
    
    setIsEditing(false);
    refreshProfile(); 
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-24 mt-4">
      <h1 className="text-3xl font-black tracking-tight uppercase italic">Settings</h1>
      
      <div className="bg-surface p-6 rounded-2xl border border-border space-y-4 shadow-sm">
        <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2">Current Program</p>
        
        {!isEditing ? (
          <>
            <p className="text-2xl font-black">{profile.split_preference}</p>
            <button onClick={() => setIsEditing(true)} className="w-full py-4 mt-4 border border-border rounded-xl font-bold hover:bg-background transition-colors">
              CHANGE ROUTINE
            </button>
          </>
        ) : (
          <div className="space-y-3 mt-4 animate-fade-in">
            {['Push / Pull / Legs', 'Upper / Lower', 'Full Body', 'Bro Split', 'Custom'].map((s) => (
              <button key={s} onClick={() => setNewSplit(s)} className={`w-full p-4 rounded-xl border text-left font-bold transition-all ${newSplit === s ? 'bg-textMain text-background border-textMain' : 'bg-background border-border text-textMain'}`}>
                {s}
              </button>
            ))}
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-4 border border-border rounded-xl font-bold">CANCEL</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-textMain text-background rounded-xl font-bold">SAVE</button>
            </div>
          </div>
        )}
      </div>

      <button onClick={() => supabase.auth.signOut()} className="w-full py-4 bg-background border border-red-900/50 text-red-500 font-bold rounded-xl mt-8 hover:bg-red-950/20 transition-colors">
        SIGN OUT
      </button>
    </div>
  );
};

// --- NAVIGATION ---
const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-surface border-t border-border pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} to={path} className={`flex flex-col items-center justify-center w-full h-full ${location.pathname === path ? 'text-textMain' : 'text-textMuted hover:text-textMain'} transition-colors`}>
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

// --- APP ROOT ---
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(data || { isNew: true });
    } catch (error) {
      setProfile({ isNew: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setLoading(true);
        fetchProfile(session.user.id);
      } else { 
        setProfile(null); 
        setLoading(false); 
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <Timer className="w-8 h-8 text-textMuted animate-spin" />
      <div className="text-textMuted font-bold tracking-widest text-sm uppercase">Loading OS...</div>
    </div>
  );

  if (!session) return <AuthScreen />;

  if (profile?.isNew) {
    return <Setup userId={session.user.id} onComplete={() => fetchProfile(session.user.id)} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-background text-textMain pb-20">
        <Routes>
          <Route path="/" element={<Dashboard profile={profile} />} />
          <Route path="/workout" element={<Workout userId={session.user.id} />} />
          <Route path="/summary" element={<WorkoutSummary refreshProfile={() => fetchProfile(session.user.id)} />} />
          <Route path="/history" element={<HistoryScreen userId={session.user.id} />} />
          <Route path="/profile" element={<ProfileScreen profile={profile} refreshProfile={() => fetchProfile(session.user.id)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  );
}
