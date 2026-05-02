# Finance Skill

> Use this when the user asks about money, balances, net worth, expenses, or anything related to personal finance.

---

## System Overview

Personal finance is managed via **hledger** running on a VPS. This is a plain-text accounting system that tracks all accounts, transactions, and budgets in a `.journal` file.

---

## Available Queries

When the user asks finance questions, use the `shell` tool to run hledger commands via SSH:

```bash
ssh [VPS] "hledger -f ~/finance/main.journal [command]"
```

### Common Commands

| Question | hledger command |
|---|---|
| "What's my balance?" | `balance -M` |
| "What's my net worth?" | `balance ^assets ^liabilities` |
| "What did I spend this month?" | `register expenses -M -b thismonth` |
| "What's my income?" | `register income -M` |
| "Add a transaction" | Append to journal file in hledger format |

---

## Transaction Format

When adding transactions:
```
YYYY-MM-DD Description
    expenses:category    $amount
    assets:checking     -$amount
```

---

## Accounts Structure

```
assets
  checking
  savings
  investments
liabilities
  credit-cards
  loans
income
  salary
  freelance
expenses
  housing
  food
  transport
  subscriptions
```
