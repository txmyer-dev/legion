# The Single-Secret JSON Pattern for GCP Secret Manager

## The Problem
As agentic frameworks and Node applications scale, they often require dozens of external API keys (LLMs, databases, external tools). 
Storing these as individual secrets in Google Secret Manager introduces two major friction points:
1. **Boot Latency:** Making 20-50 separate API calls during the application boot sequence drastically slows down startup times.
2. **Cost:** Google Secret Manager provides the first 6 active secret versions per month for free. Storing 100 keys individually breaks the free tier and introduces unnecessary overhead.

## The Solution
Instead of creating a 1:1 mapping of environment variables to Google Secrets, we bundle the entire environment configuration into a **single JSON payload** and store it as a single Google Secret (e.g., `LEGION_EKKO_SECRETS`).

### Why this works:
* **Exponential Cost Reduction:** You can store 100+ API keys inside a single secret, keeping your active secret count at 1, completely insulating you from per-secret billing.
* **O(1) Boot Time:** The application only ever makes one API call on boot, fetching all credentials in milliseconds.
* **Transparent to Legacy Code:** By parsing the JSON and iterating over the keys to inject them directly into Node's `process.env` in memory, the rest of the application (plugins, SDKs) requires zero refactoring. They continue to call `process.env.MY_API_KEY` exactly as they did with a `.env` file.

## Implementation

### 1. The Google Cloud Secret
Create a single secret containing your JSON payload:
```json
{
  "GEMINI_API_KEY": "AIzaSy...",
  "GITHUB_TOKEN": "ghp_...",
  "TODOIST_API_TOKEN": "2850..."
}
```

### 2. The Loader Utility (`secretLoader.ts`)
```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export async function loadGoogleSecrets(projectId: string, secretName: string) {
    console.log(`Fetching secrets from Google Secret Manager (${secretName})...`);
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
        process.exit(1); // Fail securely
    }
}
```

### 3. The Boot Injection (`index.ts`)
Before starting your server or framework, block the boot sequence to load the credentials into RAM.
```typescript
import { loadGoogleSecrets } from './secretLoader';

// 1. Block boot sequence until secrets are in memory
await loadGoogleSecrets('your-project-id', 'LEGION_EKKO_SECRETS');

// 2. Start the application normally
startGateway();
```
