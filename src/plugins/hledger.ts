import { execSync } from 'child_process';
import type { LegionPlugin } from './index';

// hledger finance plugin — runs hledger commands locally or via SSH.
// Set HLEDGER_MODE=local (default) or HLEDGER_MODE=ssh
// Set HLEDGER_SSH_HOST and HLEDGER_JOURNAL_PATH for SSH mode.

const MODE = process.env.HLEDGER_MODE ?? 'local';
const SSH_HOST = process.env.HLEDGER_SSH_HOST ?? '';
const JOURNAL = process.env.HLEDGER_JOURNAL_PATH ?? '~/finance/main.journal';

function runHledger(command: string): string {
    const base = `hledger -f ${JOURNAL} ${command}`;
    const cmd = MODE === 'ssh' && SSH_HOST ? `ssh ${SSH_HOST} "${base}"` : base;
    try {
        return execSync(cmd, { timeout: 10000, encoding: 'utf-8' }).trim();
    } catch (e: any) {
        return e.stderr?.toString()?.trim() ?? e.message ?? 'Unknown hledger error';
    }
}

export const financeBalancePlugin: LegionPlugin = {
    declaration: {
        name: "finance_balance",
        description: "Get account balances using hledger. Shows all accounts or a specific account.",
        parameters: {
            type: "OBJECT",
            properties: {
                account: { type: "STRING", description: "Optional account filter (e.g. 'assets', 'expenses', 'income')" },
                monthly: { type: "BOOLEAN", description: "Show monthly breakdown. Default: false" }
            }
        }
    },
    execute: async (args: any) => {
        const flags = args?.monthly ? '-M' : '';
        const account = args?.account ? ` ${args.account}` : '';
        const result = runHledger(`balance${account} ${flags}`);
        return { output: result };
    }
};

export const financeRegisterPlugin: LegionPlugin = {
    declaration: {
        name: "finance_register",
        description: "Show transaction history (register) for an account.",
        parameters: {
            type: "OBJECT",
            properties: {
                account: { type: "STRING", description: "Account to query (e.g. 'expenses', 'income:salary')" },
                period: { type: "STRING", description: "Time period: 'thismonth', 'lastmonth', 'thisyear', or a date range" },
                limit: { type: "NUMBER", description: "Max transactions to return. Default: 20" }
            },
            required: ["account"]
        }
    },
    execute: async (args: any) => {
        if (!args?.account) return { error: "account is required." };
        const period = args.period ? `-p "${args.period}"` : '-b thismonth';
        const result = runHledger(`register ${args.account} ${period}`);
        return { output: result };
    }
};

export const financeNetworthPlugin: LegionPlugin = {
    declaration: {
        name: "finance_networth",
        description: "Get current net worth: assets minus liabilities.",
        parameters: { type: "OBJECT", properties: {} }
    },
    execute: async (_args: any) => {
        const result = runHledger(`balance ^assets ^liabilities --flat`);
        return { output: result };
    }
};

export const financeAddTransactionPlugin: LegionPlugin = {
    declaration: {
        name: "finance_add_transaction",
        description: "Add a new financial transaction to the journal.",
        parameters: {
            type: "OBJECT",
            properties: {
                date: { type: "STRING", description: "Date in YYYY-MM-DD format. Default: today" },
                description: { type: "STRING", description: "Transaction description (payee/note)" },
                from_account: { type: "STRING", description: "Source account (e.g. 'assets:checking')" },
                to_account: { type: "STRING", description: "Destination account (e.g. 'expenses:food')" },
                amount: { type: "STRING", description: "Amount with currency symbol (e.g. '$42.50')" }
            },
            required: ["description", "from_account", "to_account", "amount"]
        }
    },
    execute: async (args: any) => {
        if (!args?.description || !args?.from_account || !args?.to_account || !args?.amount) {
            return { error: "description, from_account, to_account, and amount are required." };
        }
        const date = args.date ?? new Date().toISOString().split('T')[0];
        const entry = `\n${date} ${args.description}\n    ${args.to_account}    ${args.amount}\n    ${args.from_account}\n`;
        const appendCmd = MODE === 'ssh' && SSH_HOST
            ? `ssh ${SSH_HOST} "echo '${entry}' >> ${JOURNAL}"`
            : `echo '${entry}' >> ${JOURNAL.replace('~', process.env.HOME ?? '~')}`;
        try {
            execSync(appendCmd, { timeout: 5000, encoding: 'utf-8' });
            return { success: true, entry: entry.trim() };
        } catch (e: any) {
            return { error: e.message };
        }
    }
};

export default [financeBalancePlugin, financeRegisterPlugin, financeNetworthPlugin, financeAddTransactionPlugin];
