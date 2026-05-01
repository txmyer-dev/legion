import { describe, it, expect } from "bun:test";
import { loadPersona } from "./personaLoader";

describe("Persona Loader", () => {
    it("should load the ekko-project persona by default and include SOUL/TOOLS/AGENTS content", () => {
        const instruction = loadPersona("ekko-project");
        // Check for section headers
        expect(instruction).toContain("Identity & Personality (SOUL)");
        expect(instruction).toContain("Capabilities & Schemas (TOOLS)");
        expect(instruction).toContain("Environmental Context (AGENTS)");
        
        // We know Ekko is in the identity/soul
        expect(instruction).toContain("Ekko"); 
    });

    it("should throw an error if the persona directory does not exist", () => {
        expect(() => loadPersona("non-existent-persona")).toThrow("Persona 'non-existent-persona' not found in");
    });
});
