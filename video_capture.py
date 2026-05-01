import cv2
import sys
import time
import base64

def main():
    # Capture from the default webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open webcam.", file=sys.stderr)
        sys.exit(1)

    fps = 1
    delay = 1.0 / fps

    try:
        while True:
            start_time = time.time()
            ret, frame = cap.read()
            
            if not ret:
                print("Error: Could not read frame.", file=sys.stderr)
                break
                
            # Resize frame to save bandwidth/processing (optional but recommended)
            # frame = cv2.resize(frame, (640, 480))
            
            # Encode as JPEG
            success, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            
            if success:
                # Encode to base64
                b64_str = base64.b64encode(buffer).decode('utf-8')
                # Write to stdout with a newline delimiter
                sys.stdout.write(b64_str + "\n")
                sys.stdout.flush()
                
            # Sleep to maintain ~1 FPS
            elapsed = time.time() - start_time
            sleep_time = max(0, delay - elapsed)
            time.sleep(sleep_time)

    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"Video capture error: {e}", file=sys.stderr)
    finally:
        cap.release()

if __name__ == "__main__":
    main()
