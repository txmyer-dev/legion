import { describe, it, expect } from "bun:test";
import { validatePath } from "../src/tools";

describe("Windows Path Validation Sandbox", () => {
    it("should allow paths within the secure root", () => {
        const result = validatePath("C:\\Users\\txmye_ficivtv\\My Drive\\sb\\some_file.txt");
        expect(result).toBe("C:\\Users\\txmye_ficivtv\\My Drive\\sb\\some_file.txt");
    });

    it("should resolve relative paths within the secure root", () => {
        const result = validatePath("some_project\\index.ts");
        expect(result).toBe("C:\\Users\\txmye_ficivtv\\My Drive\\sb\\some_project\\index.ts");
    });

    it("should prevent directory traversal attacks", () => {
        expect(() => {
            validatePath("..\\..\\Windows\\System32\\cmd.exe");
        }).toThrow("Security Violation: Path traversal outside secure root.");
    });

    it("should prevent absolute paths outside the secure root", () => {
        expect(() => {
            validatePath("D:\\Hack\\malware.exe");
        }).toThrow("Security Violation: Path traversal outside secure root.");
    });
});

describe("Command Execution Sandbox", () => {
    it("should reject commands not on the allowlist", async () => {
        const { executeTool } = await import("../src/tools");
        const result = await executeTool("execute_local_command", { command: "rm -rf /" });
        expect(result.error).toBe("Security Violation: Command 'rm' is not allowed.");
    });

    it("should allow whitelisted commands", async () => {
        const { executeTool } = await import("../src/tools");
        const result = await executeTool("execute_local_command", { command: "dir" });
        // It might fail locally to run 'dir', but it shouldn't throw a Security Violation
        expect(result.error).not.toBe("Security Violation: Command 'dir' is not allowed.");
    });
});
