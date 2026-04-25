import { useState, useCallback, useRef, useEffect } from 'react';

export default function useSpeechOutput({ enabled }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const checkDoneRef = useRef(null);

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    if (checkDoneRef.current) {
      clearInterval(checkDoneRef.current);
      checkDoneRef.current = null;
    }
  }, []);

  const speak = useCallback((text, onEnd) => {
    if (!text || !enabled) {
      if (onEnd) onEnd();
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize high-quality male voices for Arjun
    const preferred = voices.find(v => 
      v.lang.startsWith("en") && 
      (v.name.includes("Male") || v.name.includes("David") || v.name.includes("Daniel") || v.name.includes("Alex") || v.name.includes("Guy"))
    ) || voices.find(v => 
      v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))
    ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
    
    if (preferred) utter.voice = preferred;
    
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  }, [enabled]);

  const monitorSpeech = useCallback(() => {
    if (checkDoneRef.current) clearInterval(checkDoneRef.current);
    checkDoneRef.current = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setIsSpeaking(false);
        clearInterval(checkDoneRef.current);
        checkDoneRef.current = null;
      }
    }, 100);
  }, []);

  useEffect(() => {
    return () => cancelSpeech();
  }, [cancelSpeech]);

  return {
    isSpeaking,
    setIsSpeaking,
    speak,
    cancelSpeech,
    monitorSpeech
  };
}
