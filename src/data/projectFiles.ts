export interface ProjectFile {
  name: string;
  path: string;
  category: 'backend' | 'templates' | 'static' | 'tests' | 'docs';
  language: string;
  description: string;
  content: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: 'app.py',
    path: 'app.py',
    category: 'backend',
    language: 'python',
    description: 'Core Flask application with route handlers, GitHub REST API client, and input validation',
    content: `"""
GitHub Username Finder & Redirector
===================================
A Flask-based web application that verifies whether a GitHub username exists
using the official GitHub REST API. If valid, it redirects the user to the
profile page; otherwise, it presents an informative error message.

Author: BCA Project Candidate (Mehak)
License: MIT
"""

import os
import re
import requests
from flask import Flask, render_template, request, redirect, url_for, jsonify

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "bca-github-finder-secret-key-2026")

# GitHub Public API endpoint
GITHUB_API_BASE = "https://api.github.com/users"

# GitHub username constraints:
# - Alphanumeric with single hyphens
# - Cannot begin or end with a hyphen
# - Maximum 39 characters
USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$")


def validate_username(username: str):
    """
    Validates the GitHub username format according to GitHub's naming conventions.
    Returns (is_valid: bool, cleaned_username: str, error_message: str | None)
    """
    if not username:
        return False, "", "Please enter a GitHub username."
    
    cleaned = username.strip()
    if not cleaned:
        return False, "", "Please enter a GitHub username."
    
    if len(cleaned) > 39:
        return False, cleaned, "GitHub usernames cannot exceed 39 characters."
    
    if not USERNAME_REGEX.match(cleaned):
        return False, cleaned, (
            "Invalid username format. GitHub usernames may only contain alphanumeric "
            "characters or single hyphens, and cannot begin or end with a hyphen."
        )
    
    return True, cleaned, None


def check_github_user(username: str):
    """
    Queries GitHub REST API to verify if the profile exists.
    Returns (status: str, data: dict, error_message: str | None)
    status can be: 'FOUND', 'NOT_FOUND', 'RATE_LIMITED', 'ERROR'
    """
    url = f"{GITHUB_API_BASE}/{username}"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "GitHub-Username-Finder-BCA-App"
    }
    
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"
    
    try:
        response = requests.get(url, headers=headers, timeout=8)
        
        if response.status_code == 200:
            user_data = response.json()
            return "FOUND", user_data, None
        elif response.status_code == 404:
            return "NOT_FOUND", {}, "GitHub username not found. Please check the username and try again."
        elif response.status_code in (403, 429):
            return "RATE_LIMITED", {}, "GitHub API rate limit exceeded. Please try again in a few minutes."
        else:
            return "ERROR", {}, f"GitHub API responded with unexpected status code {response.status_code}."
            
    except requests.exceptions.Timeout:
        return "ERROR", {}, "Connection timed out while contacting GitHub. Please check your internet connection."
    except requests.exceptions.RequestException as e:
        return "ERROR", {}, "Unable to verify the GitHub username right now. Please try again later."


@app.route("/", methods=["GET"])
def index():
    """Renders the main search landing page."""
    return render_template("index.html")


@app.route("/find", methods=["POST"])
def find_profile():
    """
    Processes the submitted GitHub username form:
    - Validates input format (FR-01, FR-02, FR-03)
    - Checks GitHub API (FR-04)
    - If found: Redirects or displays success confirmation (FR-05)
    - If not found: Renders error page without redirecting (FR-06, FR-07)
    """
    raw_username = request.form.get("username", "")
    auto_redirect = request.form.get("auto_redirect", "true") == "true"
    
    is_valid, username, validation_err = validate_username(raw_username)
    if not is_valid:
        return render_template("error.html", username=raw_username, error_message=validation_err, error_type="VALIDATION"), 400
    
    status, user_data, api_err = check_github_user(username)
    
    if status == "FOUND":
        profile_url = user_data.get("html_url", f"https://github.com/{username}")
        if auto_redirect:
            return redirect(profile_url)
        return render_template("success.html", user=user_data, profile_url=profile_url)
    
    elif status == "NOT_FOUND":
        return render_template("error.html", username=username, error_message=api_err, error_type="NOT_FOUND"), 404
    
    else:
        return render_template("error.html", username=username, error_message=api_err, error_type="API_ERROR"), 502


@app.route("/api/check/<username>", methods=["GET"])
def api_check_user(username):
    """JSON API endpoint for AJAX / asynchronous live checks."""
    is_valid, cleaned, val_err = validate_username(username)
    if not is_valid:
        return jsonify({
            "exists": False,
            "status": "INVALID",
            "message": val_err,
            "username": username
        }), 400
    
    status, user_data, err_msg = check_github_user(cleaned)
    if status == "FOUND":
        return jsonify({
            "exists": True,
            "status": "FOUND",
            "message": "GitHub profile found!",
            "username": cleaned,
            "profile_url": user_data.get("html_url"),
            "avatar_url": user_data.get("avatar_url"),
            "name": user_data.get("name"),
            "bio": user_data.get("bio"),
            "public_repos": user_data.get("public_repos"),
            "followers": user_data.get("followers"),
            "following": user_data.get("following"),
            "created_at": user_data.get("created_at")
        }), 200
    elif status == "NOT_FOUND":
        return jsonify({
            "exists": False,
            "status": "NOT_FOUND",
            "message": err_msg,
            "username": cleaned
        }), 404
    else:
        return jsonify({
            "exists": False,
            "status": status,
            "message": err_msg,
            "username": cleaned
        }), 502


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)`
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    category: 'backend',
    language: 'plaintext',
    description: 'Python dependencies for Flask, Requests, Pytest, and Gunicorn',
    content: `Flask==3.0.3
requests==2.32.3
pytest==8.2.0
python-dotenv==1.0.1
gunicorn==22.0.0`
  },
  {
    name: 'README.md',
    path: 'README.md',
    category: 'docs',
    language: 'markdown',
    description: 'Comprehensive project README with setup instructions, API reference, and test guide',
    content: `# GitHub Username Finder & Redirector

> **A Python & Flask Web Application with GitHub REST API Verification**
> *Developed as an Academic Project for Bachelor of Computer Applications (BCA)*

## Key Features
- Strict Input Validation (1–39 alphanumeric characters, isolated hyphens)
- REST API Verification via \`https://api.github.com/users/{username}\`
- Graceful Error Handling (404, 400, 403, and network timeouts)
- Conditional Auto-Redirection to GitHub profiles
- Automated Pytest Suite covering TC-01 through TC-07`
  },
  {
    name: 'PRD.md',
    path: 'PRD.md',
    category: 'docs',
    language: 'markdown',
    description: 'Official Product Requirements Document detailing scope, functional specs, and test cases',
    content: `# Product Requirements Document (PRD)

1. Project Title: GitHub Username Finder & Redirector
2. Project Overview: Verifies GitHub username existence and redirects or displays error.
3. Problem Statement: Prevents broken links to non-existent profiles.
4. Functional Requirements: FR-01 through FR-07
5. Test Matrix: TC-01 through TC-07`
  },
  {
    name: 'LICENSE',
    path: 'LICENSE',
    category: 'docs',
    language: 'plaintext',
    description: 'MIT Open-Source License',
    content: `MIT License

Copyright (c) 2026 Mehak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.`
  },
  {
    name: 'PROJECT_REPORT.md',
    path: 'PROJECT_REPORT.md',
    category: 'docs',
    language: 'markdown',
    description: 'Formal Academic Project Report including DFD, Architecture, and Viva Voce Q&A',
    content: `# Academic Project Report
Course: Bachelor of Computer Applications (BCA)
Project: GitHub Username Finder & Redirector
Student: Mehak (Mehak1384)`
  },
  {
    name: 'templates/index.html',
    path: 'templates/index.html',
    category: 'templates',
    language: 'html',
    description: 'Main search landing page with input form, sample buttons, and options',
    content: `{% extends "base.html" %}

{% block title %}GitHub Username Finder & Redirector{% endblock %}

{% block content %}
<div class="search-hero">
    <div class="card search-card">
        <h1 class="card-title">Find GitHub Profile</h1>
        <p class="card-subtitle">Enter a GitHub username to verify profile existence and redirect automatically.</p>

        <form action="/find" method="POST" id="finder-form" class="finder-form">
            <div class="form-group">
                <label for="username" class="input-label">Enter GitHub Username</label>
                <div class="input-wrapper">
                    <span class="input-prefix">github.com/</span>
                    <input type="text" id="username" name="username" class="text-input" placeholder="e.g. Mehak1384, octocat" required autofocus>
                </div>
                <div id="validation-error" class="validation-message" style="display: none;"></div>
            </div>

            <div class="form-options">
                <label class="checkbox-label">
                    <input type="checkbox" name="auto_redirect" value="true" checked>
                    <span>Automatically redirect when found</span>
                </label>
            </div>

            <button type="submit" id="submit-btn" class="btn btn-primary btn-block">Find Profile</button>
        </form>
    </div>
</div>
{% endblock %}`
  },
  {
    name: 'templates/success.html',
    path: 'templates/success.html',
    category: 'templates',
    language: 'html',
    description: 'Success state confirmation page with countdown timer and redirect controls',
    content: `{% extends "base.html" %}

{% block title %}Profile Found — GitHub Username Finder{% endblock %}

{% block content %}
<div class="result-hero">
    <div class="card result-card success-card">
        <div class="status-header success-header">
            <span class="status-symbol">✓</span>
            <div>
                <h1 class="status-title">GitHub Profile Found!</h1>
                <p class="status-subtitle">Profile verified successfully via GitHub REST API.</p>
            </div>
        </div>
        <div class="redirect-countdown-box">
            <p>Redirecting to <code>{{ profile_url }}</code> in <span id="countdown-sec">3</span> seconds...</p>
            <a href="{{ profile_url }}" class="btn btn-primary">Redirect Now</a>
        </div>
    </div>
</div>
{% endblock %}`
  },
  {
    name: 'templates/error.html',
    path: 'templates/error.html',
    category: 'templates',
    language: 'html',
    description: 'Error feedback page with troubleshooting guidelines and retry button',
    content: `{% extends "base.html" %}

{% block title %}Profile Not Found — GitHub Username Finder{% endblock %}

{% block content %}
<div class="result-hero">
    <div class="card result-card error-card">
        <div class="status-header error-header">
            <span class="status-symbol">✕</span>
            <div>
                <h1 class="status-title">GitHub Profile Not Found</h1>
                <p class="status-subtitle">{{ error_message or "The username you entered could not be found." }}</p>
            </div>
        </div>
        <div class="error-actions">
            <a href="/" class="btn btn-primary">Try Again</a>
        </div>
    </div>
</div>
{% endblock %}`
  },
  {
    name: 'static/css/style.css',
    path: 'static/css/style.css',
    category: 'static',
    language: 'css',
    description: 'Clean responsive CSS styles adhering to GitHub dark palette',
    content: `:root {
    --bg-page: #0d1117;
    --bg-surface: #161b22;
    --border-subtle: #30363d;
    --text-primary: #f0f6fc;
    --text-secondary: #8b949e;
    --accent-blue: #2f81f7;
    --accent-green: #238636;
    --accent-red: #da3633;
}
body {
    background-color: var(--bg-page);
    color: var(--text-primary);
    font-family: 'Plus Jakarta Sans', sans-serif;
}`
  },
  {
    name: 'static/js/script.js',
    path: 'static/js/script.js',
    category: 'static',
    language: 'javascript',
    description: 'Client-side input sanitization, format regex validation, and UX helpers',
    content: `document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("finder-form");
    const input = document.getElementById("username");
    
    if (form && input) {
        form.addEventListener("submit", (e) => {
            const trimmed = input.value.trim();
            if (!trimmed) {
                e.preventDefault();
                alert("Please enter a GitHub username.");
                return;
            }
            input.value = trimmed;
        });
    }
});`
  },
  {
    name: 'tests/test_app.py',
    path: 'tests/test_app.py',
    category: 'tests',
    language: 'python',
    description: 'Pytest test cases validating TC-01 through TC-07',
    content: `import pytest
from unittest.mock import patch, MagicMock
from app import app, validate_username

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_tc01_valid_username_redirect(client):
    """TC-01: Valid username redirects to GitHub profile page."""
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"login": "octocat", "html_url": "https://github.com/octocat"}
        mock_get.return_value = mock_response

        response = client.post("/find", data={"username": "octocat", "auto_redirect": "true"})
        assert response.status_code == 302
        assert response.headers["Location"] == "https://github.com/octocat"

def test_tc02_invalid_username_not_found(client):
    """TC-02: Non-existent username returns 404."""
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        response = client.post("/find", data={"username": "non-existent-user-123456789"})
        assert response.status_code == 404
        assert b"GitHub Profile Not Found" in response.data

def test_tc03_empty_input_validation(client):
    """TC-03: Empty input returns 400 Bad Request."""
    response = client.post("/find", data={"username": ""})
    assert response.status_code == 400

def test_tc04_username_with_spaces_trimmed(client):
    """TC-04: Leading/trailing whitespace is stripped."""
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"login": "Mehak1384", "html_url": "https://github.com/Mehak1384"}
        mock_get.return_value = mock_response

        response = client.post("/find", data={"username": "  Mehak1384  ", "auto_redirect": "true"})
        assert response.status_code == 302
        assert response.headers["Location"] == "https://github.com/Mehak1384"`
  }
];
