#!/Users/jsteiner/src/blog.jimmac.eu/venv-py310/bin/python
"""Test Chatterbox TTS with a short sample."""

import torch
from chatterbox.tts_turbo import ChatterboxTurboTTS
import numpy as np
from scipy.io import wavfile
import sys

# Set default dtype
torch.set_default_dtype(torch.float32)

# Initialize model
print("Loading Chatterbox model...")
model = ChatterboxTurboTTS.from_pretrained(device="cpu")

# Test text
test_text = "Hello, this is a test of the Chatterbox text to speech system. I am testing the voice quality and clarity."

print(f"Generating audio for: {test_text}")

# Generate with reference voice
wav = model.generate(test_text, audio_prompt_path="scripts/voice_reference_10s.wav")

print(f"Generated audio shape: {wav.shape}")
print(f"Sample rate: {model.sr}")

# Save as WAV
audio_np = wav.cpu().numpy()
if audio_np.ndim == 2:
    audio_np = audio_np[0]
audio_np = np.clip(audio_np, -1.0, 1.0)
audio_int16 = (audio_np * 32767).astype(np.int16)

output_path = "test_chatterbox_output.wav"
wavfile.write(output_path, model.sr, audio_int16)

print(f"Saved to: {output_path}")
print(f"Duration: {len(audio_int16) / model.sr:.2f} seconds")
