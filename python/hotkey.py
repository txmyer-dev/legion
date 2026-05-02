import sys
import keyboard

def on_trigger():
    print("TRIGGERED", flush=True)

# Register the hotkey
try:
    keyboard.add_hotkey('ctrl+shift+l', on_trigger)
    # Block forever waiting for hotkeys
    keyboard.wait()
except Exception as e:
    print(f"Error starting hotkey listener: {e}", file=sys.stderr, flush=True)
    sys.exit(1)
