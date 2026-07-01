# Git Push Security Audit

Scan the most recently pushed commits for any private or sensitive information that must not live in a public repository.

## Steps

1. Identify what was pushed:
   ```
   git log --oneline @{u}..HEAD 2>/dev/null || git log --oneline -1
   ```

2. Get the full diff of pushed changes:
   ```
   git diff @{u}..HEAD 2>/dev/null || git diff HEAD~1..HEAD
   ```

3. Scan every added line (`+` prefix) in the diff for:

   | Category | Examples to look for |
   |---|---|
   | API keys & tokens | `sk-`, `ghp_`, `gho_`, `AKIA`, `AIza`, `xoxb-`, `xoxp-`, `Bearer ` followed by a long string |
   | Passwords | `password=`, `passwd=`, `pwd=`, `secret=` followed by a non-placeholder value |
   | Private keys & certs | `-----BEGIN RSA PRIVATE KEY-----`, `-----BEGIN EC PRIVATE KEY-----`, `-----BEGIN OPENSSH PRIVATE KEY-----` |
   | Database connection strings | `mongodb+srv://user:pass@`, `postgres://user:pass@`, `mysql://user:pass@` |
   | Hardcoded private URLs / IPs | `192.168.`, `10.0.`, `172.16.`–`172.31.`, internal hostnames like `*.internal`, `*.local` |
   | PII | real full names, `@` email addresses, phone numbers in any format, national ID patterns |
   | `.env` values | lines matching `VAR_NAME=actual_value` (not `VAR_NAME=` or placeholder) |
   | Auth / session tokens | `Authorization:`, `Cookie:`, `Set-Cookie:`, JWT-shaped strings (`eyJ...`) |
   | Cloud credentials | AWS `aws_access_key_id`, `aws_secret_access_key`; GCP service account JSON; Azure client secrets |

4. **Do not flag** obviously safe patterns:
   - Placeholder strings: `YOUR_API_KEY`, `<your-token>`, `REPLACE_ME`, `example.com`
   - Test fixture values clearly labeled as fake
   - Code comments that mention the concept of a key without containing one

## Report Format

**If clean:**
> Security audit passed. No sensitive information found in the pushed commits.

**If issues found — one block per finding:**
```
FINDING: <type of sensitive data>
File:    <relative file path>
Line:    ~<line number or range>
Content: <redacted excerpt — show the key name but mask the value>
Fix:     <concrete remediation step>
```

After all findings, add:
> ACTION REQUIRED: Rotate any exposed credentials immediately. Consider using `git filter-repo` or BFG Repo Cleaner to remove secrets from git history if they were pushed to a shared remote.

## Notes

- This skill is also called automatically by the PostToolUse hook in `.claude/settings.local.json` after every `git push`.
- To run manually: type `/git-security-audit` in any Claude Code session in this project.
- Related memory: [[security-audit-setup]]
