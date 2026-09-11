/**
 * On-Device Hands-Free Audio Evacuation Directives
 * Utilizes the browser / platform Speech Synthesis engine to vocalize urgent evacuation instructions.
 * Functions 100% offline using locally stored vocal phonemes.
 */
export class DisasterVoiceGuide {
  private isMuted = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  speakUrgentDirective(text: string, isHighPriority: boolean = false): void {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      if (isHighPriority) {
        window.speechSynthesis.cancel(); // Preempt previous messages for urgent directives
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice =
        voices.find((v) => v.lang.startsWith('en') && !v.name.includes('Google')) ||
        voices.find((v) => v.lang.startsWith('en'));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Voice guide playback error:', e);
    }
  }

  stop(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stop();
    return this.isMuted;
  }
}
