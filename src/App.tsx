import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Home, History, User, Play, Zap, Target, Square, CheckCircle, Plus, X, Edit3 } from 'lucide-react';
import { supabase } from './lib/supabase';

// --- CUSTOM ICONS ---
const SimpleDumbbell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="5" y="7" width="4" height="10" rx="1" />
    <rect x="15" y="7" width="4" height="10" rx="1" />
    <line x1="9" y1="12" x2="15" y2="12" strokeWidth="2" />
  </svg>
);

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

// --- CUSTOM BUILDER COMPONENT ---
const CustomBuilder = ({ onSave, onCancel, initialData }: any) => {
  const [step, setStep] = useState(1);
  const [splitName, setSplitName] = useState(() => {
    if (!initialData) return '';
    return Object.keys(WORKOUT_LIBRARIES).includes(initialData.name) ? `${initialData.name} Custom` : initialData.name;
  });
  const [daysCount, setDaysCount] = useState(initialData?.days?.length || 3);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [builtDays, setBuiltDays] = useState<any[]>([]);
  const [dayName, setDayName] = useState('Day 1');
  const [exercises, setExercises] = useState([{ name: '', sets: 3, reps: '8-12' }]);

  useEffect(() => {
    if (step === 2) {
      if (initialData?.days?.[currentDayIndex]) {
        setDayName(initialData.days[currentDayIndex].dayName);
        setExercises(initialData.days[currentDayIndex].exercises);
      } else {
        setDayName(`Day ${currentDayIndex + 1}`);
        setExercises([{ name: '', sets: 3, reps: '8-12' }]);
      }
    }
  }, [currentDayIndex, step, initialData]);

  const nextDay = () => {
    const newBuiltDays = [...builtDays, { dayName, exercises: exercises.filter(e => e.name.trim() !== '') }];
    if (currentDayIndex + 1 < daysCount) {
      setBuiltDays(newBuiltDays);
      setCurrentDayIndex(prev => prev + 1);
    } else {
      onSave(splitName, newBuiltDays);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6 animate-fade-in w-full pb-24">
        <h2 className="text-3xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Configure Split</h2>
        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4">
          <div>
            <label className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2 block">Split Name</label>
            <input type="text" value={splitName} onChange={e => setSplitName(e.target.value)} placeholder="e.g. My Arnold Split" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all" />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2 block">Number of Days</label>
            <input type="number" min="1" max="14" value={daysCount} onChange={e => setDaysCount(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all" />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          {onCancel && <button onClick={onCancel} className="flex-1 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-colors">CANCEL</button>}
          <button onClick={() => splitName.trim() && daysCount > 0 && setStep(2)} className={`flex-1 py-4 font-black rounded-xl transition-all shadow-lg ${splitName.trim() ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02]' : 'bg-white/5 text-gray-500 pointer-events-none border border-white/10'}`}>START BUILDING</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in w-full overflow-y-auto pb-32">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">{splitName}</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Building Day {currentDayIndex + 1} of {daysCount}</p>
      </div>
      
      <div>
        <label className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2 block">Day Title</label>
        <input type="text" value={dayName} onChange={e => setDayName(e.target.value)} placeholder="e.g. Push Day" className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 font-bold text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all shadow-[0_8px_32px_rgba(0,0,0,0.2)]" />
      </div>

      <div className="space-y-4">
        {exercises.map((ex, idx) => (
          <div key={idx} className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 space-y-3 relative shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            {exercises.length > 1 && <button onClick={() => setExercises(exercises.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"><X className="w-5 h-5" /></button>}
            <input type="text" value={ex.name} onChange={(e) => { const newPlan = [...exercises]; newPlan[idx].name = e.target.value; setExercises(newPlan); }} placeholder="Exercise" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 font-bold text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all" />
            <div className="flex gap-3">
              <div className="flex-1"><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Sets</label><input type="number" value={ex.sets} onChange={(e) => { const newPlan = [...exercises]; newPlan[idx].sets = Number(e.target.value); setExercises(newPlan); }} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all" /></div>
              <div className="flex-1"><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Reps</label><input type="text" value={ex.reps} onChange={(e) => { const newPlan = [...exercises]; newPlan[idx].reps = e.target.value; setExercises(newPlan); }} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all" /></div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setExercises([...exercises, { name: '', sets: 3, reps: '8-12' }])} className="w-full py-4 border border-dashed border-white/20 text-gray-300 font-bold rounded-xl hover:text-black hover:bg-white hover:border-white flex items-center justify-center gap-2 transition-all"><Plus className="w-5 h-5" /> ADD EXERCISE</button>
      
      <div className="flex gap-3 mt-8">
        {onCancel && <button onClick={onCancel} className="flex-1 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-colors">CANCEL</button>}
        <button onClick={nextDay} className="flex-1 py-4 font-black rounded-xl bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all">{currentDayIndex + 1 === daysCount ? 'SAVE SPLIT' : 'NEXT DAY →'}</button>
      </div>
    </div>
  );
};

// --- AUTHENTICATION SCREEN ---
const AuthScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (!cleanUsername) return setError("Please enter a valid username.");
    const backgroundEmail = `${cleanUsername}@fitnessos.local`;

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email: backgroundEmail, password });
      if (error) setError(error.message.includes("Invalid login") ? "Username or password incorrect." : error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email: backgroundEmail, password });
      if (error) setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#050505] to-black flex flex-col justify-center p-6 space-y-8 animate-fade-in text-white selection:bg-white/30">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">FITNESS OS</h1>
        <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</p>
      </div>
      
      <div className="space-y-4 bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-600 to-white opacity-50"></div>
        {error && <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-200 text-sm rounded-lg backdrop-blur-sm">{error}</div>}
        <div>
          <label className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2 block">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. IronLifter99" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all" />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2 block">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-bold text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all" />
        </div>
        <button onClick={handleAuth} className="w-full py-4 mt-4 bg-white text-black font-black text-lg rounded-xl hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]">
          {isLogin ? 'LOG IN' : 'SIGN UP'}
        </button>
      </div>
      <button onClick={() => setIsLogin(!isLogin)} className="text-gray-400 text-sm font-bold w-full text-center hover:text-white transition-colors">
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
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#050505] to-black text-white flex flex-col justify-center p-6 space-y-8 animate-fade-in">
        <h2 className="text-4xl font-black tracking-tight uppercase text-white">What should we call you?</h2>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arju" className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-2xl font-bold text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white shadow-2xl transition-all" />
        <button onClick={() => name.trim() && setStep(2)} className={`w-full py-5 font-black text-lg rounded-xl transition-all shadow-lg ${name.trim() ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02]' : 'bg-white/5 text-gray-500 border border-white/10 pointer-events-none'}`}>CONTINUE</button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#050505] to-black text-white flex flex-col p-6 pt-12">
        <CustomBuilder onSave={(customName: string, planData: any) => saveProfile(customName, { [customName]: planData })} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#050505] to-black text-white flex flex-col justify-center p-6 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tight uppercase text-white">Choose your split</h2>
      </div>
      <div className="space-y-4">
        {['Push / Pull / Legs', 'Upper / Lower', 'Full Body', 'Bro Split', 'Custom'].map((s) => (
          <button key={s} onClick={() => setSplit(s)} className={`w-full p-6 rounded-2xl border text-left text-xl font-bold transition-all backdrop-blur-md shadow-lg ${split === s ? 'bg-white text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-[1.02]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>{s}</button>
        ))}
      </div>
      <button onClick={() => split === 'Custom' ? setStep(3) : saveProfile(split)} className={`w-full py-5 font-black text-lg rounded-xl transition-all shadow-lg mt-4 ${split ? 'bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-gray-500 border border-white/10 pointer-events-none'}`}>
        {split === 'Custom' ? 'BUILD ROUTINE →' : 'FINISH SETUP'}
      </button>
    </div>
  );
};

// --- DASHBOARD COMPONENT ---
const Dashboard = ({ profile }: { profile: any }) => {
  const navigate = useNavigate();

  let customRoutines: any = {};
  if (Array.isArray(profile.custom_plan)) customRoutines = { 'Custom Workout': profile.custom_plan };
  else if (profile.custom_plan) customRoutines = profile.custom_plan;
  
  const userSplit = WORKOUT_LIBRARIES[profile.split_preference] || customRoutines[profile.split_preference] || [];
  const todaysRoutine = userSplit[profile.current_day_index] || { dayName: 'Workout', exercises: [] };
  const todaysPlan = todaysRoutine.exercises || [];

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-24">
      <header className="mt-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-400">Good evening, <span className="text-white drop-shadow-md">{profile.name}</span></h1>
        <p className="text-gray-500 mt-1 font-medium">Ready to crush your goals?</p>
      </header>

      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Today's Training</h2>
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
          <h3 className="text-3xl font-black italic tracking-tight mb-6 uppercase text-white drop-shadow-md">{todaysRoutine.dayName}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-2 relative z-10">
            <div className="bg-black/40 rounded-2xl p-5 border border-white/10 flex flex-col justify-between backdrop-blur-md">
              <Target className="w-6 h-6 text-white mb-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              <div>
                <p className="text-3xl font-black text-white">{todaysPlan.reduce((acc: number, curr: any) => acc + curr.sets, 0)}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Sets Today</p>
              </div>
            </div>
            <div className="bg-black/40 rounded-2xl p-5 border border-white/10 flex flex-col justify-between backdrop-blur-md">
              <Zap className="w-6 h-6 text-white mb-3 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              <div>
                <p className="text-xl font-bold text-white line-clamp-1">{profile.split_preference}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Current Split</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Today's Exercises</h2>
        <div className="space-y-3">
          {todaysPlan.map((ex: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
              <span className="font-bold text-lg text-white truncate pr-4">{ex.name}</span>
              <span className="text-sm text-black font-bold font-mono bg-white px-3 py-1.5 rounded-lg whitespace-nowrap shadow-[0_0_10px_rgba(255,255,255,0.2)]">{ex.sets} × {ex.reps}</span>
            </div>
          ))}
        </div>
      </section>

      <button onClick={() => navigate('/workout', { state: { todaysRoutine, splitLength: userSplit.length } })} className="w-full py-5 bg-white text-black font-black text-xl rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">
        <Play className="w-6 h-6 fill-black" /> START WORKOUT
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

  useEffect(() => {
    if (activeExercise?.name) {
      const memory = JSON.parse(localStorage.getItem('fitnessOsWeights') || '{}');
      if (memory[activeExercise.name]) setCurrentWeight(memory[activeExercise.name]);
      else setCurrentWeight('');
      setCurrentReps('');
    }
  }, [activeExercise?.name]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!energy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 space-y-10 animate-fade-in pb-24">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">HOW ARE YOU FEELING?</h2>
          <p className="text-gray-400 text-sm font-medium">This automatically adjusts today's volume.</p>
        </div>
        <div className="flex w-full gap-3">
          {[1, 2, 3, 4, 5].map((level) => (
            <button key={level} onClick={() => setEnergy(level)} className="flex-1 aspect-square rounded-2xl text-2xl font-black bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all">{level}</button>
          ))}
        </div>
      </div>
    );
  }

  const handleCompleteSet = () => {
    const w = Number(currentWeight);
    const r = Number(currentReps);
    if (w > 0 && r > 0) {
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
      <div className="flex justify-between items-center pb-4 border-b border-white/10 mt-4 relative">
        <div>
          <h1 className="text-3xl font-black tracking-tight italic uppercase text-white drop-shadow-md">{todaysRoutine.dayName}</h1>
          <p className="text-white text-sm font-bold flex items-center gap-1 mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"><Zap className="w-4 h-4 fill-white" /> Energy: {energy}/5</p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-mono font-black tracking-widest ${isTracking ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]' : 'text-gray-500'}`}>{formatTime(elapsedTime)}</div>
        </div>
      </div>

      {!isTracking ? (
        <div className="py-16 flex flex-col items-center space-y-4">
          <div className="p-6 bg-white/5 rounded-full backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <SimpleDumbbell className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-400 font-bold text-lg mt-4">Ready when you are.</p>
          <button onClick={() => setIsTracking(true)} className="w-full py-5 mt-6 bg-white text-black font-black text-xl rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all">START TRACKING</button>
        </div>
      ) : (
        <>
          <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-white opacity-50"></div>
            <p className="text-white text-xs font-bold tracking-widest uppercase mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Live Volume</p>
            <p className="text-6xl font-black text-white drop-shadow-lg">{volume.toLocaleString()} <span className="text-2xl text-gray-400 font-normal">kg</span></p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center">
               <h3 className="font-black text-2xl uppercase tracking-wide text-white">{activeExercise?.name}</h3>
               <span className="text-sm text-black font-bold font-mono bg-white px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(255,255,255,0.2)]">{activeExercise?.target}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">Weight (kg)</label>
                <input type="number" inputMode="decimal" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-4xl font-black text-center text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all shadow-inner" />
              </div>
              <div className="flex-1">
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">Reps</label>
                <input type="number" inputMode="numeric" value={currentReps} onChange={(e) => setCurrentReps(e.target.value)} className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-4xl font-black text-center text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all shadow-inner" />
              </div>
            </div>
            <button onClick={handleCompleteSet} className="w-full py-5 bg-white text-black font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all mt-2">
              <CheckCircle className="w-6 h-6" /> COMPLETE SET
            </button>
            {currentExerciseIndex < workoutPlan.length - 1 && (
              <button onClick={() => setCurrentExerciseIndex(prev => prev + 1)} className="w-full py-4 bg-transparent border border-white/10 text-gray-300 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all mt-2">NEXT EXERCISE →</button>
            )}
          </div>
        </>
      )}

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-40">
        <button onClick={handleFinish} className="w-full py-5 bg-black/50 backdrop-blur-xl border border-white/20 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-black/70 transition-all pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <Square className="w-5 h-5 fill-white" /> FINISH WORKOUT
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
      <div className="text-center space-y-2 mt-12">
        <h1 className="text-5xl font-black tracking-tight uppercase italic text-white drop-shadow-lg">Workout Complete</h1>
        <p className="text-gray-400 font-medium">Session securely saved to database.</p>
      </div>
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 blur-3xl rounded-full"></div>
        
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Volume</p><p className="text-3xl font-black text-white">{stats.finalVolume.toLocaleString()} <span className="text-sm font-normal text-gray-500">kg</span></p></div>
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Duration</p><p className="text-3xl font-black text-white">{minutes} <span className="text-sm font-normal text-gray-500">min</span></p></div>
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Sets</p><p className="text-3xl font-black text-white">{stats.finalSets}</p></div>
          <div><p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Energy Logged</p><p className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{stats.energyLevel} / 5</p></div>
        </div>
      </div>
      <button 
        onClick={() => { refreshProfile(); navigate('/'); }}
        className="w-full py-5 bg-white text-black font-black text-xl rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] transition-all mt-8"
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

  if (loading) return <div className="p-6 text-gray-400 font-bold mt-8 tracking-widest uppercase text-sm animate-pulse">LOADING HISTORY...</div>;

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-24 mt-4">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-black tracking-tight uppercase italic text-white drop-shadow-md">History</h1>
        {logs.length > 0 && (
          <button onClick={handleClear} className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-2 hover:text-white transition-colors">Clear All</button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center text-gray-400 font-medium shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          No workouts logged yet. Time to get to work!
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-xl uppercase text-white">{log.day_name}</h3>
                <span className="text-[10px] text-black font-bold uppercase tracking-widest bg-white px-2 py-1 rounded-md">{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div><span className="text-gray-500 uppercase text-[10px] tracking-widest block mb-1">Volume</span> <span className="font-bold text-white">{log.total_volume.toLocaleString()}kg</span></div>
                <div><span className="text-gray-500 uppercase text-[10px] tracking-widest block mb-1">Sets</span> <span className="font-bold text-white">{log.sets_completed}</span></div>
                <div><span className="text-gray-500 uppercase text-[10px] tracking-widest block mb-1">Time</span> <span className="font-bold text-white">{Math.ceil(log.duration_seconds/60)}m</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- PROFILE SCREEN ---
const ProfileScreen = ({ profile, refreshProfile }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [newSplit, setNewSplit] = useState(profile.split_preference);

  let customRoutines: any = {};
  if (Array.isArray(profile.custom_plan)) customRoutines = { 'Custom Workout': profile.custom_plan };
  else if (profile.custom_plan) customRoutines = profile.custom_plan;
  
  const availableSplits = [...Object.keys(WORKOUT_LIBRARIES), ...Object.keys(customRoutines)];
  const userCurrentSplitData = WORKOUT_LIBRARIES[profile.split_preference] || customRoutines[profile.split_preference] || [];

  const handleSave = async () => {
    await supabase.from('profiles').update({ 
      split_preference: newSplit,
      current_day_index: 0 
    }).eq('id', profile.id);
    
    setIsEditing(false);
    refreshProfile(); 
  };

  const handleSaveCustom = async (name: string, plan: any) => {
    const updatedCustomPlans = { ...customRoutines, [name]: plan };
    await supabase.from('profiles').update({ 
      split_preference: name,
      custom_plan: updatedCustomPlans,
      current_day_index: 0 
    }).eq('id', profile.id);
    
    setIsBuilding(false);
    setIsEditing(false);
    refreshProfile();
  };

  if (isBuilding) {
    return (
      <div className="p-6 pt-12 pb-24">
        <CustomBuilder initialData={editData} onSave={handleSaveCustom} onCancel={() => setIsBuilding(false)} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-24 mt-4">
      <h1 className="text-4xl font-black tracking-tight uppercase italic text-white drop-shadow-md">Settings</h1>
      
      <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Program</p>
        
        {!isEditing ? (
          <>
            <p className="text-3xl font-black text-white">{profile.split_preference}</p>
            
            <div className="flex flex-col gap-3 mt-6 pt-2">
              <button onClick={() => { setEditData({ name: profile.split_preference, days: userCurrentSplitData }); setIsBuilding(true); }} className="w-full py-4 border border-white/20 bg-black/20 backdrop-blur-md text-white font-bold rounded-2xl hover:bg-white/10 flex items-center justify-center gap-2 transition-all shadow-inner">
                <Edit3 className="w-5 h-5" /> EDIT CURRENT SPLIT
              </button>
              <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/5 backdrop-blur-md">
                SWAP ROUTINE
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3 mt-4 animate-fade-in">
            {availableSplits.map((s) => (
              <button key={s} onClick={() => setNewSplit(s)} className={`w-full p-5 rounded-2xl border text-left font-bold transition-all shadow-md ${newSplit === s ? 'bg-white text-black border-transparent scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-black/40 border-white/10 text-white hover:bg-white/10'}`}>
                {s}
              </button>
            ))}
            
            <button onClick={() => { setEditData(null); setIsBuilding(true); }} className="w-full py-5 border border-dashed border-white/20 text-gray-300 font-bold rounded-2xl hover:text-black hover:bg-white hover:border-white flex items-center justify-center gap-2 mt-4 transition-all"><Plus className="w-5 h-5" /> CREATE NEW SPLIT</button>

            <div className="flex gap-3 pt-6 border-t border-white/10 mt-6">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">CANCEL</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-white text-black rounded-xl font-black hover:scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all">SAVE</button>
            </div>
          </div>
        )}
      </div>

      <button onClick={() => supabase.auth.signOut()} className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-2xl mt-8 hover:bg-white/10 hover:text-white transition-colors backdrop-blur-md">
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
    { path: '/workout', icon: SimpleDumbbell, label: 'Workout' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-black/60 backdrop-blur-2xl border-t border-white/10 pb-safe z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link key={path} to={path} className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-gray-500 hover:text-gray-300'}`}>
              <Icon className={`w-6 h-6 mb-1.5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>
            </Link>
          );
        })}
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#050505] to-black flex flex-col items-center justify-center space-y-5 text-white">
      <div className="p-4 bg-white/5 rounded-full backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
         <SimpleDumbbell className="w-6 h-6 text-white animate-spin" />
      </div>
      <div className="text-white font-bold tracking-widest text-[10px] uppercase drop-shadow-md">Loading OS...</div>
    </div>
  );

  if (!session) return <AuthScreen />;

  if (profile?.isNew) {
    return <Setup userId={session.user.id} onComplete={() => fetchProfile(session.user.id)} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#050505] to-black text-white pb-20 selection:bg-white/30">
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
