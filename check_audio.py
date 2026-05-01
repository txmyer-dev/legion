import pyaudio
import numpy as np

p = pyaudio.PyAudio()

print("Default input device:")
try:
    info = p.get_default_input_device_info()
    print(f"Name: {info['name']}, Index: {info['index']}")
except Exception as e:
    print("Error getting default input device:", e)

print("\nTesting microphone for 2 seconds...")
try:
    stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=1024)
    frames = []
    for _ in range(0, int(16000 / 1024 * 2)):
        data = stream.read(1024, exception_on_overflow=False)
        frames.append(np.frombuffer(data, dtype=np.int16))
    
    stream.stop_stream()
    stream.close()
    
    audio_data = np.concatenate(frames)
    max_amp = np.max(np.abs(audio_data))
    mean_amp = np.mean(np.abs(audio_data))
    
    print(f"\nAudio stats -> Max Amplitude: {max_amp}, Mean Amplitude: {mean_amp}")
    if max_amp < 100:
        print("WARNING: Audio seems very quiet. You might have the wrong default microphone selected, or it's muted.")
    else:
        print("Microphone is picking up sound properly!")

except Exception as e:
    print("Error recording:", e)

p.terminate()
