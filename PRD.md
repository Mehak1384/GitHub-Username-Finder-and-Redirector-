# Product Requirements Document (PRD)

## 1. Project Title
**GitHub Username Finder & Redirector**

---

## 2. Project Overview
GitHub Username Finder & Redirector is a Python-based web application that allows users to enter a GitHub username and verify whether the corresponding GitHub profile exists.

- If the username is found, the application redirects the user to the actual GitHub profile page.
- If the username is invalid or the profile does not exist, the application displays an appropriate error message without redirecting the user.

### Example
- User enters: `"Mehak1384"`
- Application verifies username with GitHub REST API.
- If found:
  `"GitHub profile found! Redirecting..."` → `https://github.com/Mehak1384`
- If not found:
  `"GitHub username not found. Please check the username and try again."`

---

## 3. Problem Statement
GitHub profiles are accessed using a specific username-based URL (`https://github.com/<username>`). Users frequently do not know if a username is valid before attempting to navigate to it, leading to broken 404 links or mistyped profiles.

This project solves this by:
- Accepting a GitHub username.
- Validating the username format and sanitizing whitespace.
- Querying GitHub's official REST API to verify profile existence.
- Automatically redirecting confirmed usernames to their real profile.
- Displaying actionable, graceful error states for non-existent or invalid handles.

---

## 4. Project Objectives
1. Develop a clean web application using Python (Flask).
2. Accept a GitHub username from the user.
3. Validate and sanitize user input before network transmission.
4. Verify profile existence via GitHub Public REST API.
5. Redirect valid usernames to their real profile.
6. Display appropriate error messages for invalid usernames.
7. Provide an accessible, responsive user interface.
8. Demonstrate Python web development concepts.
9. Demonstrate REST API integration, HTTP status code handling, and exceptions.
10. Deploy and structure the project to academic BCA standards.

---

## 5. Target Users
- Students and Educators
- Software Engineers and Recruiters
- Interviewers and HR Managers
- Open-Source Collaborators

---

## 6. Scope
### 6.1 In Scope
- GitHub username input textfield with submit trigger.
- Client and server-side input validation (empty check, whitespace trim, regex compliance).
- Profile existence check via GitHub REST API endpoint (`https://api.github.com/users/<username>`).
- Success confirmation with automatic redirection.
- Error state messaging for 404, invalid format, and API rate limits.
- Full responsive web layout.
- Modular Flask architecture with automated Pytest test suite.

### 6.2 Out of Scope
- GitHub OAuth login / account management.
- Creation or modification of repositories.
- Password or token harvesting (strictly zero-credential).
- Access to private GitHub repositories or organizational secrets.

---

## 7. Technology Stack
| Component | Technology | Description |
|---|---|---|
| Programming Language | Python 3.10+ | Backend runtime |
| Backend Framework | Flask 3.0+ | Micro web framework for routing and templates |
| HTTP Client | Requests 2.32+ | External API requests to GitHub |
| Testing Suite | Pytest 8.0+ | Unit and integration test assertions |
| Frontend Core | HTML5 / Jinja2 | Semantic page templating |
| Styling | Modern CSS3 | Responsive design & GitHub dark aesthetic |
| Client Functionality | JavaScript ES6 | Live validation, countdown redirect |
| External API | GitHub REST API v3 | `https://api.github.com/users/{username}` |

---

## 8. High-Level System Flow
```
User
  ↓
Enter GitHub Username
  ↓
Click "Find Profile"
  ↓
Validate Input (Client & Server)
  ↓
Send Request to GitHub API (https://api.github.com/users/{username})
  ↓
Is Profile Found?
  ├── YES (HTTP 200)
  │     ↓
  │  Display Success Confirmation
  │     ↓
  │  Redirect to GitHub Profile (https://github.com/{username})
  │
  └── NO (HTTP 404 / 400 / 403)
        ↓
     Display Error Message
        ↓
     Prompt User to Correct Username
```

---

## 9. Functional Requirements
- **FR-01: Username Input** — Single textfield with autofocus and submit button.
- **FR-02: Empty Input Validation** — Blocks empty submissions with `"Please enter a GitHub username."`.
- **FR-03: Username Validation** — Trims whitespace and enforces GitHub username pattern `^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$`.
- **FR-04: GitHub Profile Verification** — Calls GitHub's `/users/{username}` endpoint.
- **FR-05: Valid Username** — Shows `"✓ GitHub profile found! Redirecting..."` and redirects to `https://github.com/{username}`.
- **FR-06: Invalid Username** — Renders `"GitHub username not found. Please check the username and try again."` without redirecting.
- **FR-07: API Error Handling** — Catches timeouts, rate limits (403), and network anomalies gracefully.

---

## 10. Test Matrix
| Test Case | Scenario | Input | Expected Result |
|---|---|---|---|
| TC-01 | Valid Username | `octocat` | 200 OK, redirects to profile |
| TC-02 | Non-existent Username | `this-user-does-not-exist-123456789` | 404 Not Found, error page |
| TC-03 | Empty Submission | `""` | 400 Bad Request, validation prompt |
| TC-04 | Whitespace Enclosed | `"  Mehak1384  "` | Trimmed to `Mehak1384` and verified |
| TC-05 | Invalid Pattern | `-invalid--user-` | Rejected by regex format validator |
| TC-06 | Rate Limit / Network | Mock 403 / Timeout | Clean fallback error message |
| TC-07 | Concurrency / Multi-query | Sequential handles | Isolated state without crosstalk |
