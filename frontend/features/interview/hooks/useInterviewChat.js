import { useState, useCallback, useEffect, useRef } from 'react';
import { streamChatMessage, evaluateInterview } from '../services/interviewApi';

export default function useInterviewChat({ problemId, code, userId, currentPhase, voiceMode, speech, onInterviewComplete }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const sendMessage = useCallback(async (text, isSystem = false) => {
    if (!text.trim() || (loading && !isSystem)) return;
    
    speech.cancelSpeech();

    let newHistory;
    if (!isSystem) {
      const userMsg = { role: 'user', content: text };
      newHistory = [...messages, userMsg];
      setMessages(newHistory);
    } else {
      newHistory = [...messages];
    }
    
    setLoading(true);

    try {
      const response = await streamChatMessage({
        problem_id: problemId,
        code,
        chat_history: newHistory,
        candidate_message: text,
        user_id: userId,
        phase: currentPhase
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let assistantContent = '';
      let spokenContent = '';
      let isComplete = false;
      let buffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantContent += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantContent;
                  return updated;
                });

                if (voiceMode) {
                  const currentText = assistantContent.slice(spokenContent.length);
                  if (/[.!?](\s|$)/.test(currentText) || (currentText.length > 50 && /[,;](\s|$)/.test(currentText))) {
                    const toSpeak = currentText.trim();
                    if (toSpeak) {
                      speech.speak(toSpeak);
                      spokenContent = assistantContent;
                    }
                  }
                }
              }
              if (data.is_complete !== undefined) isComplete = data.is_complete;
            } catch (e) { console.error("Parse error:", e); }
          }
        }
      }

      if (voiceMode && assistantContent.length > spokenContent.length) {
        const toSpeak = assistantContent.slice(spokenContent.length).trim();
        if (toSpeak) speech.speak(toSpeak, () => speech.setIsSpeaking(false));
      } else if (voiceMode) {
        speech.monitorSpeech();
      }

      if (isComplete) {
        onInterviewComplete([...newHistory, { role: 'assistant', content: assistantContent }]);
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check your internet.' }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, problemId, code, userId, currentPhase, voiceMode, speech, onInterviewComplete]);

  const runEvaluation = useCallback(async (finalHistory) => {
    speech.cancelSpeech();
    setEvaluating(true);
    try {
      const res = await evaluateInterview({
        problem_id: problemId,
        code,
        chat_history: finalHistory || messages,
        user_id: userId
      });
      return res;
    } finally {
      setEvaluating(false);
    }
  }, [problemId, code, messages, userId, speech]);

  return {
    messages,
    setMessages,
    loading,
    evaluating,
    sendMessage,
    runEvaluation
  };
}
