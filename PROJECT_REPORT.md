# Academic Project Report

## Project Title: GitHub Username Finder & Redirector
- **Course**: Bachelor of Computer Applications (BCA)
- **Subject**: Web Application Development & Python Programming
- **Student Name**: Mehak
- **Registration / Roll No.**: Mehak1384
- **Academic Year**: 2025–2026

---

## Table of Contents
1. Certificate & Declaration
2. Acknowledgements
3. Executive Summary
4. Introduction & Problem Statement
5. Feasibility Study & Requirement Analysis
6. System Design & Architecture (DFD, Flowchart)
7. Technology Stack & Implementation
8. Testing & Verification Matrix
9. Screenshots & User Interface Flow
10. Future Enhancements & Conclusion
11. Viva Voce Q&A Reference

---

## 1. Executive Summary
The **GitHub Username Finder & Redirector** is an interactive web tool engineered using Python, Flask, and RESTful web service architecture. The application is designed to solve common navigation friction caused by broken or mistyped GitHub user handles. By verifying candidate usernames against GitHub's official Public REST API before initiating page transitions, the system guarantees that users are only redirected to legitimate, active accounts. For non-existent or malformed usernames, the application retains the user within the search environment and displays structured, context-sensitive diagnostic guidance.

---

## 2. Requirement Analysis

### 2.1 Hardware Requirements
- **Processor**: Intel Core i3 / AMD Ryzen 3 or equivalent (Minimum 1.5 GHz)
- **RAM**: 2 GB RAM (4 GB recommended)
- **Disk Space**: 100 MB free space for code and Python runtime

### 2.2 Software Requirements
- **Operating System**: Linux (Ubuntu/Debian), macOS, or Windows 10/11
- **Python Version**: Python 3.10 or higher
- **Web Browser**: Google Chrome, Mozilla Firefox, or Microsoft Edge
- **Libraries**: Flask 3.0+, Requests 2.32+, Pytest 8.0+

---

## 3. Data Flow Diagram (DFD)

### Level 0 DFD (Context Level)
```
[ User ] ---- (Username Input) ----> [ GitHub Username Finder System ]
[ User ] <--- (Profile Redirect / Error) -- [ GitHub Username Finder System ]
[ GitHub REST API ] <---> (HTTP GET / JSON Response) <---> [ System ]
```

### Level 1 DFD (Process Level)
```
User
 │
 ▼
[ 1.0 Input & Sanitization ] ─── (Empty / Malformed) ───> [ Error View (400) ]
 │
 │ (Clean Username)
 ▼
[ 2.0 API Dispatcher (Requests) ] ───> GitHub API (api.github.com/users/:id)
 │
 ├── [ HTTP 200 OK ] ─────────> [ 3.0 Redirect Engine ] ───> Redirect to GitHub Profile
 ├── [ HTTP 404 Not Found ] ───> [ 4.0 Error Handler ] ────> Not Found View (404)
 └── [ HTTP 403 / 500 ] ───────> [ 5.0 Exception Shield ] ─> API Unavailable Notice
```

---

## 4. Software Architecture & Implementation Details

### 4.1 Flask Routing Structure
1. `GET /`: Serves `index.html` allowing the user to provide an input string.
2. `POST /find`:
   - Extracts the form parameter `username`.
   - Executes regular expression validation: `^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$`.
   - Sends non-blocking HTTP GET with a standard user-agent header to avoid GitHub bot classification.
   - Conditionally triggers `flask.redirect()` with HTTP 302 or renders `error.html`.
3. `GET /api/check/<username>`: JSON REST endpoint designed for asynchronous consumption.

### 4.2 Security Considerations
- **No Password Collection**: The project adheres to zero-credential principles.
- **Header Injection & ReDoS Defense**: Input length is strictly capped at 39 characters before regular expression evaluation.
- **Environment Isolation**: API tokens and secret keys are loaded via environment variables (`os.environ`).

---

## 5. Testing & Test Results

All 7 test cases from the PRD were implemented using `pytest` and executed:

| Test ID | Description | Input | Expected Output | Status |
|---|---|---|---|---|
| TC-01 | Valid active user | `octocat` | 302 Redirect to `https://github.com/octocat` | PASS |
| TC-02 | Non-existent user | `this-user-does-not-exist-123456789` | 404 Status, error view displayed | PASS |
| TC-03 | Empty string | `""` | 400 Status, validation warning | PASS |
| TC-04 | Leading/trailing spaces | `"  Mehak1384  "` | Stripped to `Mehak1384`, verified | PASS |
| TC-05 | Consecutive hyphens | `user--name` | 400 Bad format rejected | PASS |
| TC-06 | API Rate limit / down | Simulated 403/timeout | Friendly warning, server does not crash | PASS |
| TC-07 | Multi-request sequence | Repeated random inputs | Independent state isolation | PASS |

---

## 6. Conclusion
The **GitHub Username Finder & Redirector** accomplishes all objectives laid out in the initial project syllabus. It successfully demonstrates the core competencies required of a BCA graduate:
- Practical Python programming and modular codebase management.
- Backend routing and templating with Flask and Jinja2.
- Third-party REST API integration, HTTP headers, and status code interpretation.
- Defensive coding, validation sanitization, and automated software testing.
