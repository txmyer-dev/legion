import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export async function loadGoogleSecrets(projectId: string, secretName: string) {
    console.log(`fetching secrets from Google Secret Manager (${secretName})...`);
    const client = new SecretManagerServiceClient();
    
    try {
        const [version] = await client.accessSecretVersion({
            name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
        });

        const payload = version.payload?.data?.toString();
        if (!payload) throw new Error("Secret payload is empty.");

        // Parse the JSON blob and inject into process.env
        const secrets = JSON.parse(payload);
        for (const [key, value] of Object.entries(secrets)) {
            process.env[key] = value as string;
        }
        
        console.log(`✅ Injected ${Object.keys(secrets).length} secrets into memory.`);
    } catch (error) {
        console.error("❌ Failed to load secrets from Google Secret Manager:", error);
        process.exit(1);
    }
}
