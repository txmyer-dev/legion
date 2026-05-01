import { describe, it, expect } from "bun:test";
import { loadPersona } from "./personaLoader";

describe("Persona Loader", () => {
    it("should load the ekko-project persona by default and include CLAUDE.md content", () => {
        const instruction = loadPersona("ekko-project");
        // We know from README that CLAUDE.md exists in ekko-project
        expect(instruction).toContain("Ekko"); 
    });

    it("should throw an error if the persona directory does not exist", () => {
        expect(() => loadPersona("non-existent-persona")).toThrow("Persona 'non-existent-persona' not found in");
    });
});
