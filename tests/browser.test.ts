import { describe, it, expect, afterAll } from "bun:test";
import { manipulateBrowser } from "../src/browser";

describe("Browser Orchestration", () => {
    afterAll(async () => {
        await manipulateBrowser('close');
    });

    it("should open a browser and navigate to a URL", async () => {
        const response = await manipulateBrowser('goto', 'https://example.com');
        expect(response.result).toContain("Navigated to");
        expect(response.title).toBe("Example Domain");
    });

    it("should extract text using a selector", async () => {
        const response = await manipulateBrowser('extract', undefined, 'h1');
        expect(response.result).toBe("Example Domain");
    });

    it("should capture a base64 screenshot", async () => {
        const response = await manipulateBrowser('screenshot');
        expect(response.image).toBeDefined();
        // A base64 string should be reasonably long
        expect(response.image.length).toBeGreaterThan(100);
    });

    it("should fail gracefully on invalid actions", async () => {
        const response = await manipulateBrowser('invalid_action');
        expect(response.error).toContain("Unknown browser action: invalid_action");
    });
});
