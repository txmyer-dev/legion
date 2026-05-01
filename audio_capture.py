import pyaudio
import sys
import os

if sys.platform == "win32":
    import msvcrt
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = int(sys.argv[1]) if len(sys.argv) > 1 else 16000

p = pyaudio.PyAudio()

try:
    stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE, input=True, frames_per_buffer=CHUNK)
    while True:
        data = stream.read(CHUNK, exception_on_overflow=False)
        sys.stdout.buffer.write(data)
        sys.stdout.buffer.flush()
except KeyboardInterrupt:
    pass
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
finally:
    if 'stream' in locals():
        stream.stop_stream()
        stream.close()
    p.terminate()
