import { describe, it, expect, mock } from "bun:test";
import { MockHardwareLayer } from "./hardware";

describe("HardwareAbstractionLayer - Video", () => {
    it("should allow simulating video frames via MockHardwareLayer", () => {
        const hal = new MockHardwareLayer();
        
        let capturedFrame: string | null = null;
        hal.startVideo((base64Jpeg: string) => {
            capturedFrame = base64Jpeg;
        });
        
        expect(hal.videoCallback).not.toBeNull();
        
        hal.simulateVideoInput("base64_mock_frame_data");
        expect(capturedFrame).toBe("base64_mock_frame_data");
        
        hal.stopVideo();
        expect(hal.videoCallback).toBeNull();
    });
});
