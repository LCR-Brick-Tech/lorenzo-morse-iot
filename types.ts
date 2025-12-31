export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  morseBio: string;
  email: string;
}

export interface MorseMessage {
  id: string;
  senderId: string;
  senderName: string; // denormalized for speed
  senderPhoto?: string;
  text: string; // The translated text
  morse: string; // The raw dots/dashes
  timestamp: number;
}

export interface SystemHealth {
  firebaseConnected: boolean;
  latencyMs: number;
  apiKeyValid: boolean;
}

export type ThemeMode = 'dark' | 'light';

export const MORSE_MAP: Record<string, string> = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
  '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
  '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
  '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
  '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
  '--..': 'Z',
  '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5',
  '-....': '6', '--...': '7', '---..': '8', '----.': '9', '-----': '0',
  '.-.-.-': '.', '--..--': ',', '..--..': '?', '-..-.': '/',
  '-....-': '-', '-.--.': '(', '-.--.-': ')'
};

export const REVERSE_MORSE_MAP: Record<string, string> = Object.entries(MORSE_MAP).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {} as Record<string, string>);