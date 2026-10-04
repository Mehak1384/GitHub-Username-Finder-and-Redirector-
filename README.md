# GitHub Username Finder & Redirector

> **A Python & Flask Web Application with GitHub REST API Verification**  
> *Developed as an Academic Project for Bachelor of Computer Applications (BCA)*

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0%2B-black?logo=flask)
![GitHub API](https://img.shields.io/badge/GitHub-REST%20API%20v3-181717?logo=github)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Abstract

In software development and recruiting, GitHub profile links are standard representations of a developer's portfolio. However, mistyped usernames or deleted accounts frequently lead to broken navigation and 404 dead ends.

**GitHub Username Finder & Redirector** is a lightweight, robust web application built using **Python and Flask**. It allows users to input any GitHub username, sanitizes and validates the input according to official GitHub naming conventions, queries the **GitHub Public REST API**, and conditionally redirects users only when a valid profile is verified. If the profile does not exist or input is invalid, it provides descriptive, non-intrusive feedback without disrupting the browsing session.

---

## 🚀 Key Features

- **Strict Input Validation**: Client and server-side validation against GitHub username rules (1–39 alphanumeric characters, isolated hyphens, trimmed whitespace).
- **REST API Verification**: Direct verification using GitHub's official endpoint (`https://api.github.com/users/{username}`) rather than speculative URL loading.
- **Graceful Error Handling**: Distinct visual feedback for 404 (User not found), 400 (Bad input), 403 (Rate limited), and connection timeouts.
- **Conditional Auto-Redirection**: Instant redirect upon verification with optional countdown and profile preview card.
- **Automated Test Suite**: Unit and integration test coverage (`pytest`) validating all Functional Requirements (TC-01 through TC-07).
- **Academic Standard Codebase**: Clean modular structure following standard Flask application conventions with Jinja2 templates and CSS styling.

---

## 📂 Project Directory Structure

```text
github-username-finder/
│
├── app.py                  # Core Flask server and route handlers
├── requirements.txt        # Python package dependencies
├── README.md               # Complete project documentation
├── PRD.md                  # Formal Product Requirements Document
├── PROJECT_REPORT.md       # BCA Academic Project Report & Viva Guide
├── LICENSE                 # MIT Open Source License
│
├── templates/              # Jinja2 HTML templates
│   ├── base.html           # Base layout template
│   ├── index.html          # Main search interface
│   ├── success.html        # Profile verification success page
│   └── error.html          # Clean error & retry interface
│
├── static/                 # Static assets
│   ├── css/
│   │   └── style.css       # Responsive styling (GitHub Slate theme)
│   └── js/
│       └── script.js       # Client validation and redirect countdown
│
└── tests/                  # Automated test suite
    └── test_app.py         # Pytest test cases (TC-01 to TC-07)
```

---

## 🛠️ Installation & Local Setup

### Prerequisites
- Python 3.10 or higher
- `pip` (Python package installer)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Mehak1384/github-username-finder.git
cd github-username-finder
```

### 2. Create and Activate a Virtual Environment
```bash
# On Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# On Windows (cmd):
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Flask Development Server
```bash
python app.py
```
*The application will start on `http://127.0.0.1:5000`.*

---

## 🧪 Running Automated Tests

Run the full automated test suite using `pytest`:

```bash
pytest tests/test_app.py -v
```

### Test Coverage Summary:
- **TC-01**: Verification of valid username (`octocat`) → redirects to `https://github.com/octocat`.
- **TC-02**: Verification of non-existent user → renders 404 error page.
- **TC-03**: Empty submission validation → returns 400 with helpful prompt.
- **TC-04**: Whitespace sanitization (`"  Mehak1384  "`) → trims and processes accurately.
- **TC-05**: Invalid characters / regex pattern rejection.
- **TC-06**: Network error & rate limit handling.
- **TC-07**: Multiple sequential queries without session crosstalk.

---

## 🌐 API Reference

### Route 1: Home Page
- **URL**: `/`
- **Method**: `GET`
- **Description**: Renders the search interface (`index.html`).

### Route 2: Find Profile
- **URL**: `/find`
- **Method**: `POST`
- **Payload Form Data**:
  - `username` *(string, required)*: The GitHub username to verify.
  - `auto_redirect` *(string, optional)*: `'true'` to redirect immediately or `'false'` to show preview.
- **Responses**:
  - `302 Found`: Redirects to `https://github.com/{username}` if profile exists.
  - `400 Bad Request`: If username input is blank or violates format rules.
  - `404 Not Found`: If GitHub returns 404 for the username.
  - `502 Bad Gateway`: If GitHub API is unreachable or rate limited.

### Route 3: JSON Check API
- **URL**: `/api/check/<username>`
- **Method**: `GET`
- **Response Format**: `application/json`

---

## 🎓 Academic Viva Voce Key Questions & Answers

1. **Why was Flask chosen over Django for this project?**
   Flask is a lightweight micro-framework ideal for single-purpose utilities and API-centric web apps, avoiding the heavyweight ORM and database overhead of Django.

2. **How does the application prevent unnecessary requests to GitHub?**
   It implements a two-tier validation approach: client-side JavaScript regex validation checks for empty strings or invalid characters before submission; server-side regex validation double-checks before issuing HTTP calls with `requests`.

3. **What happens when GitHub rate-limits requests?**
   Unauthenticated requests to the GitHub API are limited to 60 per hour per IP. The application checks for HTTP 403 / 429 status codes and displays a polite rate-limit notification instead of crashing.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
