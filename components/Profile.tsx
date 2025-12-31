import React, { useState } from 'react';
import { UserProfile } from '../types.ts';
import { updateProfile } from 'firebase/auth';
import { ref, set, db, auth } from '../services/firebase.ts';
import { X, Save, User, Quote } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, isOpen, onClose }) => {
  const [name, setName] = useState(user.displayName);
  const [bio, setBio] = useState(user.morseBio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (auth.currentUser) {
        // Update Auth Profile
        await updateProfile(auth.currentUser, {
            displayName: name
        });
        
        // Update DB Profile
        await set(ref(db, `users/${user.uid}/profile`), {
            uid: user.uid,
            displayName: name,
            photoURL: user.photoURL,
            email: user.email,
            morseBio: bio
        });
        onClose();
      }
    } catch (err) {
        setError('Failed to update profile.');
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative animate-[scale-in_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Operator Profile</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-white/70" />
            </button>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-white/40 uppercase mb-2 pl-1">Callsign (Name)</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-white/30" size={16} />
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full glass-input rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-scienceBlue/50 transition-colors"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-white/40 uppercase mb-2 pl-1">Morse Bio (Short)</label>
                <div className="relative">
                    <Quote className="absolute left-3 top-3 text-white/30" size={16} />
                    <input 
                        type="text" 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="CQ CQ..."
                        maxLength={30}
                        className="w-full glass-input rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-scienceBlue/50 transition-colors font-mono"
                    />
                </div>
            </div>

            {error && <div className="text-red-400 text-sm text-center">{error}</div>}

            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full glass-btn-primary py-3 rounded-xl font-semibold text-white mt-4 flex items-center justify-center space-x-2 active:scale-95 transition-transform"
            >
                {saving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Save size={18} />
                        <span>Update Credentials</span>
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};