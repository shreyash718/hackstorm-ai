import { useState, useEffect, useRef, useCallback } from 'react';

export default function useVoiceInput({ onTranscriptReady, disabled }) {
  const [status, setStatus] = useState('idle'); // idle, recording, ready
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timerRef = useRef(null);
  const lastSpeechTimeRef = useRef(Date.now());
  
  const statusRef = useRef(status);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const baseTranscriptRef = useRef('');

  // --- Initialize Speech Recognition ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        lastSpeechTimeRef.current = Date.now();
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        const base = baseTranscriptRef.current;
        setTranscript(base ? `${base} ${currentTranscript}` : currentTranscript);
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') return;
        console.error("Speech Recognition Error:", event.error);
        setStatus('idle');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    analyzerRef.current = null;
    setVolume(0);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { 
        recognitionRef.current.stop(); 
        setTimeout(() => {
          try { recognitionRef.current.abort(); } catch(e) {}
        }, 100);
      } catch(e) {
        try { recognitionRef.current.abort(); } catch(e2) {}
      }
    }
    cleanupStream();
    setStatus('ready');
  }, [cleanupStream]);

  const startRecording = useCallback(async () => {
    try {
      window.speechSynthesis.cancel();
      
      if (statusRef.current === 'ready') {
        baseTranscriptRef.current = transcript;
      } else {
        baseTranscriptRef.current = '';
        setTranscript('');
      }
      
      lastSpeechTimeRef.current = Date.now();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const updateVolume = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        setVolume(sum / dataArray.length);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      setStatus('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const next = prev + 1;
          if (next >= 90) stopRecording();
          return next;
        });

        const secondsSinceLastSpeech = (Date.now() - lastSpeechTimeRef.current) / 1000;
        if (secondsSinceLastSpeech >= 30) {
          stopRecording();
        }
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, [stopRecording, transcript]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    baseTranscriptRef.current = '';
    setStatus('idle');
    cleanupStream();
  }, [cleanupStream]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        const currentStatus = statusRef.current;
        if (currentStatus === 'recording') {
          stopRecording();
        } else if ((currentStatus === 'idle' || currentStatus === 'ready') && !disabledRef.current) {
          startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startRecording, stopRecording]);

  useEffect(() => {
    return () => cleanupStream();
  }, [cleanupStream]);

  return {
    status,
    transcript,
    setTranscript,
    volume,
    recordingTime,
    startRecording,
    stopRecording,
    resetTranscript,
  };
}
