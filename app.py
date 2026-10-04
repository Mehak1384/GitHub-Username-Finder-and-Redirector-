"""
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


def extract_username(raw: str) -> str:
    """Extracts username if user enters a full GitHub profile URL."""
    val = raw.strip()
    val = re.sub(r"^https?://", "", val, flags=re.I)
    val = re.sub(r"^www\.", "", val, flags=re.I)
    val = re.sub(r"^github\.com/", "", val, flags=re.I)
    val = val.split("/")[0].split("?")[0].split("#")[0]
    return val.strip()


def validate_username(username: str):
    """
    Validates the GitHub username format according to GitHub's naming conventions.
    Returns (is_valid: bool, cleaned_username: str, error_message: str | None)
    """
    if not username:
        return False, "", "Please enter your GitHub ID or GitHub link."
    
    cleaned = extract_username(username)
    if not cleaned:
        return False, "", "Please enter your GitHub ID or GitHub link."
    
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
    
    # Optional personal token if configured in environment
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
        # Direct redirect or intermediate success page
        if auto_redirect:
            return redirect(profile_url)
        return render_template("success.html", user=user_data, profile_url=profile_url)
    
    elif status == "NOT_FOUND":
        return render_template("error.html", username=username, error_message=api_err, error_type="NOT_FOUND"), 404
    
    else:
        return render_template("error.html", username=username, error_message=api_err, error_type="API_ERROR"), 502


@app.route("/api/check/<username>", methods=["GET"])
def api_check_user(username):
    """
    JSON API endpoint for AJAX / asynchronous live checks.
    """
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


@app.errorhandler(404)
def page_not_found(e):
    return render_template("error.html", username="", error_message="The requested page was not found.", error_type="PAGE_NOT_FOUND"), 404


@app.errorhandler(500)
def server_error(e):
    return render_template("error.html", username="", error_message="An internal server error occurred.", error_type="SERVER_ERROR"), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
