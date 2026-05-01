import pyaudio
import sys
import os

if sys.platform == "win32":
    import msvcrt
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)

CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = int(sys.argv[1]) if len(sys.argv) > 1 else 16000

p = pyaudio.PyAudio()

try:
    stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, output=True, frames_per_buffer=CHUNK)
    while True:
        data = sys.stdin.buffer.read(CHUNK)
        if not data:
            break
        stream.write(data)
except KeyboardInterrupt:
    pass
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
finally:
    if 'stream' in locals():
        stream.stop_stream()
        stream.close()
    p.terminate()
