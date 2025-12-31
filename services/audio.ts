class AudioController {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private thumpOscillator: OscillatorNode | null = null;
  private thumpGain: GainNode | null = null;

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // High pitch for DOT/DASH sound
  public startTone(frequency: number = 600) {
    if (!this.ctx) return;
    
    // Create nodes
    this.oscillator = this.ctx.createOscillator();
    this.gainNode = this.ctx.createGain();
    
    // Connect
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    
    // Config
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = frequency;
    
    // Smooth attack
    const now = this.ctx.currentTime;
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
    
    this.oscillator.start(now);
  }

  public stopTone() {
    if (!this.ctx || !this.gainNode || !this.oscillator) return;
    
    const now = this.ctx.currentTime;
    // Smooth release
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    this.oscillator.stop(now + 0.05);
    
    // Cleanup references after stop
    setTimeout(() => {
      this.oscillator?.disconnect();
      this.gainNode?.disconnect();
      this.oscillator = null;
      this.gainNode = null;
    }, 60);
  }

  // 150Hz Thump for Haptic feedback simulation
  public playThump() {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.value = 150; // Thump freq
    
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.8, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // Short thud
    
    osc.start(now);
    osc.stop(now + 0.1);
  }
}

export const audioController = new AudioController();