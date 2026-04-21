import os
from google import genai
from google.genai import types
import wave
import io
from dotenv import load_dotenv

# Load env vars for API key
load_dotenv()

def wrap_pcm_in_wav(pcm_data, channels=1, rate=24000, sample_width=2):
    """Wraps raw PCM data in a WAV container."""
    with io.BytesIO() as wav_io:
        with wave.open(wav_io, "wb") as wf:
            wf.setnchannels(channels)
            wf.setsampwidth(sample_width)
            wf.setframerate(rate)
            wf.writeframes(pcm_data)
        return wav_io.getvalue()

def test_tts():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in environment.")
        return

    print("Connecting to Gemini 3.1 Flash TTS...")
    client = genai.Client(api_key=api_key)
    
    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-tts-preview",
            contents="Say cheerfully: This is a test of the HackStorm AI voice system.",
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name='Kore',
                        )
                    )
                ),
            )
        )
        
        # Check if we have audio data
        if not response.candidates:
            print("ERROR: No candidates in response.")
            return

        parts = response.candidates[0].content.parts
        print(f"Response received. Number of parts: {len(parts)}")
        
        raw_pcm = None
        for i, part in enumerate(parts):
            if part.inline_data:
                print(f"Part {i} has inline_data with mime_type: {part.inline_data.mime_type}")
                raw_pcm = part.inline_data.data
                break
        
        if not raw_pcm:
            print("ERROR: No raw PCM data found in response parts.")
            return

        print(f"Raw PCM data size: {len(raw_pcm)} bytes")
        
        # Wrap in WAV
        wav_data = wrap_pcm_in_wav(raw_pcm)
        print(f"Wrapped WAV data size: {len(wav_data)} bytes")
        
        # Save to file
        with open("tts_test_output.wav", "wb") as f:
            f.write(wav_data)
        print("SUCCESS: Audio saved to tts_test_output.wav")

    except Exception as e:
        print(f"CRITICAL ERROR during TTS call: {e}")

if __name__ == "__main__":
    test_tts()
