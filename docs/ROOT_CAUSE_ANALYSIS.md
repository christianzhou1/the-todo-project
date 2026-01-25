# Root Cause Analysis (RCA) Guide

## What is Root Cause Analysis?

**Root Cause Analysis (RCA)** is a systematic process for identifying the fundamental reason(s) why an incident, problem, or error occurred. Instead of just fixing symptoms, RCA digs deeper to find the underlying cause to prevent recurrence.

### The 5 Whys Technique

A simple but effective RCA method:
1. **Why did the error occur?** → Answer
2. **Why did that happen?** → Answer
3. **Why did that happen?** → Answer
4. **Why did that happen?** → Answer
5. **Why did that happen?** → Root Cause

### Example from This Project

**Symptom:** Tests failing with "Cannot find module '@testing-library/dom'"

1. **Why?** → Package not installed
2. **Why?** → Not in package.json dependencies
3. **Why?** → It's a peer dependency, assumed to be auto-installed
4. **Why?** → npm install --legacy-peer-deps doesn't install peer deps
5. **Root Cause:** Missing explicit dependency declaration

**Solution:** Add `@testing-library/dom` to package.json

## RCA Process for This Project

### 1. **Incident Detection**
- Monitor logs, error tracking, test failures
- User reports
- CI/CD pipeline failures

### 2. **Data Collection**
- Error logs with stack traces
- Request/response data
- User actions leading to error
- Environment details
- Timeline of events

### 3. **Analysis**
- Use 5 Whys technique
- Identify contributing factors
- Map cause-and-effect relationships

### 4. **Root Cause Identification**
- Distinguish between symptoms and root causes
- Consider: code bugs, configuration issues, design flaws, process gaps

### 5. **Solution Design**
- Fix the root cause (not just symptoms)
- Implement preventive measures
- Update documentation
- Add monitoring/alerting

### 6. **Verification**
- Test the fix
- Monitor for recurrence
- Validate preventive measures

## RCA Template

Use this template when documenting incidents:

```markdown
## Incident: [Brief Description]

**Date:** YYYY-MM-DD
**Severity:** Critical/High/Medium/Low
**Status:** Open/Investigating/Resolved

### Symptoms
- What was observed?
- Error messages
- User impact

### Timeline
- When did it start?
- Key events leading to incident

### Data Collected
- Logs
- Stack traces
- Request/response data
- Environment details

### Analysis (5 Whys)
1. Why? → 
2. Why? → 
3. Why? → 
4. Why? → 
5. Why? → 

### Root Cause
[The fundamental reason]

### Contributing Factors
- Factor 1
- Factor 2

### Solution
- Immediate fix
- Long-term prevention
- Code changes
- Process changes

### Verification
- How was it tested?
- Monitoring added?

### Prevention
- What prevents this from happening again?
- Documentation updates
- Code improvements
```

## Implementation in This Project

### Enhanced Error Logging

The project already has good error handling in `GlobalExceptionHandler`. Enhance it for RCA:

1. **Add Correlation IDs** - Track requests across services
2. **Structured Logging** - Include context (user, request, environment)
3. **Error Context** - Capture state at time of error
4. **Error Tracking** - Use tools like Sentry, Rollbar, or ELK stack

### RCA Tools Integration

1. **Log Aggregation** (ELK, Splunk, CloudWatch)
2. **Error Tracking** (Sentry, Rollbar, Bugsnag)
3. **APM** (New Relic, Datadog, AppDynamics)
4. **Distributed Tracing** (Jaeger, Zipkin)

### Best Practices

1. **Log at appropriate levels**
   - ERROR: System failures, exceptions
   - WARN: Recoverable issues, validation failures
   - INFO: Important business events
   - DEBUG: Detailed diagnostic information

2. **Include context**
   - User ID
   - Request ID
   - Timestamp
   - Environment
   - Request details

3. **Don't log sensitive data**
   - Passwords
   - Tokens
   - PII (unless necessary and compliant)

4. **Use structured logging**
   - JSON format
   - Consistent fields
   - Machine-readable

## Example RCA Workflow

### Scenario: User Login Fails

1. **Detect:** Error log shows "Authentication failed"
2. **Collect:** 
   - Log entry with stack trace
   - User ID, timestamp
   - Request details
3. **Analyze:**
   - Why? → JWT validation failed
   - Why? → Token expired
   - Why? → Token expiration time too short
   - Why? → Configuration issue
   - Root Cause: jwt.expiration misconfigured
4. **Fix:** Update configuration, add validation
5. **Prevent:** Add config validation on startup, monitoring

## Next Steps

1. Set up error tracking (Sentry recommended)
2. Enhance logging with correlation IDs
3. Create RCA documentation template
4. Establish incident response process
5. Set up monitoring and alerting

