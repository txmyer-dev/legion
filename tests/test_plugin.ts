import { pluginManager } from '../src/plugins/index';
import { loadGoogleSecrets } from '../src/secretLoader';

async function main() {
    // 1. Load secrets into memory so the plugins have what they need (API keys, etc.)
    await loadGoogleSecrets('personal-api-488606', 'LEGION_EKKO_SECRETS');

    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log("Usage: bun run tests/test_plugin.ts <plugin_name> [json_args]");
        console.log("\nAvailable plugins:");
        pluginManager.getFunctionDeclarations().forEach(p => console.log(`  - ${p.name}`));
        process.exit(1);
    }

    const pluginName = args[0];
    let pluginArgs = {};
    
    // Parse the optional second argument as a JSON object
    if (args[1]) {
        try {
            pluginArgs = JSON.parse(args[1]);
        } catch (e: any) {
            console.error("Failed to parse JSON arguments. Make sure it's valid JSON.");
            console.error(e.message);
            process.exit(1);
        }
    }

    console.log(`Executing '${pluginName}' with args:`, pluginArgs);
    console.log('--------------------------------------------------');
    
    try {
        const startTime = Date.now();
        const result = await pluginManager.executeTool(pluginName as string, pluginArgs);
        const elapsed = Date.now() - startTime;
        
        console.log(JSON.stringify(result, null, 2));
        console.log('--------------------------------------------------');
        console.log(`Finished in ${elapsed}ms`);
    } catch (e) {
        console.error("Plugin crashed:", e);
    }
    
    process.exit(0);
}

main();
