import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  auth, db, ref, set, push, onValue, serverTimestamp, 
  signInWithPopup, googleProvider, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, onAuthStateChanged, 
  onDisconnect,
  User
} from './services/firebase';
import { audioController } from './services/audio';
import { NavBar } from './components/NavBar';
import { Visualizer } from './components/Visualizer';
import { MorseKey } from './components/MorseKey';
import { CheatSheet } from './components/CheatSheet';
import { MessageList } from './components/MessageList';
import { Profile } from './components/Profile';
import { UserProfile, MorseMessage, MORSE_MAP, SystemHealth } from './types';
import { Zap, WifiOff, AlertTriangle } from 'lucide-react';

export default function App() {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<MorseMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<MorseMessage | null>(null);
  const [isSplashOpen, setSplashOpen] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Morse Logic State
  const [localMorseBuffer, setLocalMorseBuffer] = useState('');
  const lastSignalTime = useRef<number>(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const charTimeoutTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [latency, setLatency] = useState(0);
  
  // Health Check
  const [health, setHealth] = useState<SystemHealth>({
    firebaseConnected: false,
    latencyMs: 0,
    apiKeyValid: true
  });

  // --- Effects ---

  // 1. Auth Listener & System Health
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch extended profile
        const profileRef = ref(db, `users/${currentUser.uid}/profile`);
        onValue(profileRef, (snapshot) => {
            const val = snapshot.val();
            if (val) setUserProfile(val);
            else {
                // Init profile if missing
                const newProfile = {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName || 'Operator',
                    photoURL: currentUser.photoURL || '',
                    email: currentUser.email || '',
                    morseBio: ''
                };
                set(profileRef, newProfile);
                setUserProfile(newProfile);
            }
        });
      }
    });

    // Simple latency check
    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            setHealth(h => ({ ...h, firebaseConnected: true }));
            // Measure latency roughly
            const start = Date.now();
            set(ref(db, 'latency_check'), start).then(() => {
                const end = Date.now();
                setLatency(end - start);
                setHealth(h => ({ ...h, latencyMs: end - start }));
            }).catch((err) => {
                if(err.code === 'auth/api-key-not-valid') {
                    setHealth(h => ({...h, apiKeyValid: false}));
                }
            });
        } else {
            setHealth(h => ({ ...h, firebaseConnected: false }));
        }
    });

    return () => unsubscribe();
  }, []);

  // 2. Message Listeners
  useEffect(() => {
    // Real-time signals (Active transmission)
    const lastMsgRef = ref(db, 'chat/last_message');
    const unsubLast = onValue(lastMsgRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
            setCurrentMessage(val);
        }
    });

    // Persistent History
    const historyRef = ref(db, 'chat/history');
    // Limit to last 50 for performance
    // Note: Firebase query limits require query() which is tree-shakeable, 
    // but for simplicity/code-size constraints we'll slice client side or trust the stream
    const unsubHistory = onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list = Object.values(data) as MorseMessage[];
            list.sort((a,b) => a.timestamp - b.timestamp);
            setMessages(list);
        }
    });

    return () => { unsubLast(); unsubHistory(); };
  }, []);

  // --- Handlers ---

  const handleEnterNetwork = async () => {
    try {
        await audioController.init();
        // Play a test sound to unlock audio context
        audioController.playThump();
        setSplashOpen(false);
    } catch (e) {
        console.error("Audio init failed", e);
    }
  };

  const handleAuth = async (isGoogle: boolean) => {
    setAuthLoading(true);
    setAuthError('');
    try {
        if (isGoogle) {
            await signInWithPopup(auth, googleProvider);
        } else {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                if (auth.currentUser) {
                    await set(ref(db, `users/${auth.currentUser.uid}/profile`), {
                        uid: auth.currentUser.uid,
                        displayName: email.split('@')[0],
                        photoURL: '',
                        email: email,
                        morseBio: ''
                    });
                }
            }
        }
    } catch (err: any) {
        setAuthError(err.message.replace('Firebase: ', ''));
        // Trigger shake effect via DOM manipulation or state driven class
        const form = document.getElementById('auth-form');
        form?.classList.add('animate-shake');
        setTimeout(() => form?.classList.remove('animate-shake'), 500);
    } finally {
        setAuthLoading(false);
    }
  };

  // --- Morse Logic ---
  
  const commitChar = useCallback(() => {
    if (!localMorseBuffer) return;
    
    // Translate
    const char = MORSE_MAP[localMorseBuffer] || '?';
    
    // Construct Message Payload
    const payload: MorseMessage = {
        id: Date.now().toString(),
        senderId: user?.uid || 'anon',
        senderName: userProfile?.displayName || 'Anon',
        senderPhoto: userProfile?.photoURL || '',
        morse: localMorseBuffer,
        text: char,
        timestamp: Date.now()
    };

    // 1. Update transient "last message" for visualizers
    set(ref(db, 'chat/last_message'), payload);

    // 2. Push to history log
    push(ref(db, 'chat/history'), payload);

    // Reset
    setLocalMorseBuffer('');
  }, [localMorseBuffer, user, userProfile]);

  const handleKeyDown = (type: 'dot' | 'dash') => {
    const now = Date.now();
    // Debounce 50ms (Simulated via ignore if too close)
    if (now - lastSignalTime.current < 50) return;
    lastSignalTime.current = now;

    // Haptics & Audio
    audioController.startTone();
    audioController.playThump();
    if (navigator.vibrate) navigator.vibrate(10); // Subtle tick

    // Clear previous commit timer
    if (charTimeoutTimer.current) clearTimeout(charTimeoutTimer.current);

    // Logic
    const symbol = type === 'dot' ? '.' : '-';
    setLocalMorseBuffer(prev => prev + symbol);
  };

  const handleKeyUp = () => {
    audioController.stopTone();
    
    // Set timer to commit character (standard morse gap is 3 dots ~ 200-300ms depending on WPM)
    // We'll use 600ms for easier typing for beginners
    charTimeoutTimer.current = setTimeout(() => {
        commitChar();
    }, 800);
  };

  // --- Render ---

  if (!health.apiKeyValid) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
            <div className="glass-panel p-8 rounded-2xl border-red-500/30">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h1 className="text-2xl font-bold mb-2">System Critical</h1>
                <p className="text-white/60 mb-4">API Configuration Failed. Check API_KEY validity.</p>
                <div className="bg-white/5 p-4 rounded font-mono text-xs text-left overflow-x-auto">
                    API_KEY: ...{auth.app.options.apiKey?.slice(-6)}
                </div>
            </div>
        </div>
    );
  }

  // Splash Screen
  if (isSplashOpen) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-scienceBlue/20 to-black pointer-events-none"></div>
            <div className="z-10 text-center space-y-8 animate-[fadeIn_1s_ease-out]">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-scienceBlue to-blue-600 rounded-3xl shadow-[0_0_50px_rgba(0,102,204,0.5)] flex items-center justify-center">
                    <Zap size={48} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tighter text-white">Morse Hub</h1>
                <p className="text-white/50 tracking-wide uppercase text-xs">High-Fidelity IoT Communication</p>
                
                <button 
                    onClick={handleEnterNetwork}
                    className="group relative px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform duration-300 overflow-hidden"
                >
                    <span className="relative z-10">Join Network</span>
                    <div className="absolute inset-0 bg-scienceBlue opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
            </div>
        </div>
    );
  }

  // Auth Screen
  if (!user) {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
             <div id="auth-form" className="glass-panel w-full max-w-sm p-8 rounded-3xl transform-gpu transition-all">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-1">Identify</h2>
                    <p className="text-white/40 text-sm">Secure frequency access</p>
                </div>

                {authError && (
                    <div className="mb-4 bg-red-500/20 border border-red-500/50 p-3 rounded-xl text-xs text-red-200 flex items-center">
                        <AlertTriangle size={14} className="mr-2" />
                        {authError}
                    </div>
                )}

                <div className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Operator Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-scienceBlue/50 outline-none transition-all"
                    />
                    <input 
                        type="password" 
                        placeholder="Passkey"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="glass-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-scienceBlue/50 outline-none transition-all"
                    />
                    
                    <button 
                        onClick={() => handleAuth(false)}
                        disabled={isAuthLoading}
                        className="w-full glass-btn-primary py-3 rounded-xl font-semibold text-white active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {isAuthLoading ? 'Authenticating...' : (authMode === 'login' ? 'Connect' : 'Register')}
                    </button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-white/30 backdrop-blur-xl">Or</span></div>
                    </div>

                    <button 
                        onClick={() => handleAuth(true)}
                        className="w-full glass-btn-secondary py-3 rounded-xl font-medium text-white flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        <span>Continue with Google</span>
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')}
                        className="text-xs text-scienceBlue hover:text-white transition-colors"
                    >
                        {authMode === 'login' ? 'New hardware? Initialize setup' : 'Already registered? Connect'}
                    </button>
                </div>
             </div>
        </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-lg min-h-screen flex flex-col p-4 relative">
        <NavBar 
            user={userProfile} 
            latency={health.latencyMs} 
            onLogout={() => signOut(auth)} 
            onProfileClick={() => setShowProfile(true)}
        />
        
        <Visualizer 
            currentMessage={currentMessage} 
            localTyping={localMorseBuffer}
            isReceiving={!!currentMessage && currentMessage.senderId !== user.uid}
            currentUser={userProfile}
        />

        <MessageList messages={messages} currentUserId={user.uid} />

        <div className="mt-auto">
             <CheatSheet />
             <MorseKey 
                onDown={handleKeyDown}
                onUp={handleKeyUp}
                disabled={!health.firebaseConnected}
             />
        </div>

        <Profile 
            user={userProfile!} 
            isOpen={showProfile} 
            onClose={() => setShowProfile(false)} 
        />
      </div>
    </div>
  );
}