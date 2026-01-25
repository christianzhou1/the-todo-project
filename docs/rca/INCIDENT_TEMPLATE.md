# Incident RCA Template

**Copy this template for each incident**

## Incident: [Brief Description]

**Date:** YYYY-MM-DD HH:MM
**Reported By:** [Name/System]
**Severity:** 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
**Status:** ⏳ Open / 🔍 Investigating / ✅ Resolved / 📋 Closed

---

## Symptoms

### What was observed?
- [ ] System crash
- [ ] Error message
- [ ] Performance degradation
- [ ] Data corruption
- [ ] Security issue
- [ ] User-facing error
- [ ] Test failure

### Error Details
```
[Paste error message/stack trace]
```

### User Impact
- Number of users affected: 
- Duration of impact:
- Business impact:

---

## Timeline

| Time | Event |
|------|-------|
| HH:MM | Initial detection |
| HH:MM | Investigation started |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Incident resolved |

---

## Data Collected

### Logs
- [Log file paths/links]
- [Relevant log entries]

### Stack Traces
```
[Stack trace]
```

### Request/Response Data
- Request ID:
- User ID:
- Endpoint:
- Request body:
- Response:

### Environment
- Environment: [Production/Staging/Development]
- Server:
- Version:
- Configuration:

### Related Issues
- Related tickets:
- Similar incidents:

---

## Analysis (5 Whys)

### 1. Why did this happen?
**Answer:** 

### 2. Why did that happen?
**Answer:** 

### 3. Why did that happen?
**Answer:** 

### 4. Why did that happen?
**Answer:** 

### 5. Why did that happen?
**Answer:** 

---

## Root Cause

**Primary Root Cause:**
[The fundamental reason the incident occurred]

**Root Cause Category:**
- [ ] Code bug
- [ ] Configuration error
- [ ] Design flaw
- [ ] Process gap
- [ ] External dependency
- [ ] Infrastructure issue
- [ ] Human error

---

## Contributing Factors

1. **Factor 1:**
   - Description:
   - Impact:

2. **Factor 2:**
   - Description:
   - Impact:

---

## Solution

### Immediate Fix
- [Action taken to resolve immediately]
- [Code changes]
- [Configuration changes]

### Long-term Fix
- [Preventive measures]
- [Code improvements]
- [Process improvements]

### Code Changes
```diff
[Code diff or link to PR]
```

### Configuration Changes
```yaml
[Configuration changes]
```

---

## Verification

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

### Monitoring
- [ ] Monitoring added
- [ ] Alerts configured
- [ ] Dashboards updated

### Validation
- How was the fix verified?
- How long was it monitored?

---

## Prevention

### What prevents recurrence?
1. [Prevention measure 1]
2. [Prevention measure 2]

### Documentation Updates
- [ ] Code comments
- [ ] README updates
- [ ] Architecture docs
- [ ] Runbooks

### Process Improvements
- [ ] Code review process
- [ ] Testing process
- [ ] Deployment process
- [ ] Monitoring process

---

## Lessons Learned

### What went well?
- 

### What could be improved?
- 

### Action Items
- [ ] Action 1
- [ ] Action 2

---

## References

- Related PRs: 
- Related issues:
- Documentation:
- External resources:

