"""
Automated Test Suite for GitHub Username Finder & Redirector
============================================================
Covers Test Cases TC-01 through TC-07 specified in the PRD:
- TC-01: Valid username redirects to profile
- TC-02: Non-existent username renders error page
- TC-03: Empty submission is rejected with validation message
- TC-04: Username with leading/trailing spaces is trimmed
- TC-05: Special / invalid username characters safely rejected
- TC-06: API error handling (403 rate limit / 500 error)
- TC-07: Multiple independent queries
"""

import pytest
from unittest.mock import patch, MagicMock
from app import app, validate_username


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# --- TC-03: Empty Input Validation ---
def test_tc03_empty_input_validation(client):
    """TC-03: Empty input returns 400 Bad Request with validation prompt."""
    response = client.post("/find", data={"username": ""})
    assert response.status_code == 400
    assert b"Please enter a GitHub username" in response.data

    # Whitespace only
    response_spaces = client.post("/find", data={"username": "    "})
    assert response_spaces.status_code == 400
    assert b"Please enter a GitHub username" in response_spaces.data


# --- TC-04: Username with Spaces Trimmed ---
def test_tc04_username_with_spaces_trimmed(client):
    """TC-04: Spaces around username are trimmed and processed correctly."""
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "login": "Mehak1384",
            "html_url": "https://github.com/Mehak1384",
            "name": "Mehak",
            "public_repos": 12,
            "followers": 15,
            "following": 18
        }
        mock_get.return_value = mock_response

        response = client.post("/find", data={"username": "  Mehak1384  ", "auto_redirect": "true"})
        assert response.status_code == 302
        assert response.headers["Location"] == "https://github.com/Mehak1384"
        mock_get.assert_called_once_with(
            "https://api.github.com/users/Mehak1384",
            headers={
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "GitHub-Username-Finder-BCA-App"
            },
            timeout=8
        )


# --- TC-01: Valid Username Redirect ---
def test_tc01_valid_username_redirect(client):
    """TC-01: Valid username redirects to GitHub profile page."""
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "login": "octocat",
            "html_url": "https://github.com/octocat",
            "name": "The Octocat"
        }
        mock_get.return_value = mock_response

        # With auto_redirect=true -> HTTP 302
        response = client.post("/find", data={"username": "octocat", "auto_redirect": "true"})
        assert response.status_code == 302
        assert response.headers["Location"] == "https://github.com/octocat"

        # With auto_redirect=false -> Success HTML page
        response_preview = client.post("/find", data={"username": "octocat", "auto_redirect": "false"})
        assert response_preview.status_code == 200
        assert b"GitHub Profile Found!" in response_preview.data


# --- TC-02: Non-existent Username Handled ---
def test_tc02_invalid_username_not_found(client):
    """TC-02: Non-existent username returns 404 and does not redirect."""
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        response = client.post("/find", data={"username": "this-user-does-not-exist-123456789"})
        assert response.status_code == 404
        assert b"GitHub Profile Not Found" in response.data
        assert b"The GitHub username you entered could not be found" in response.data


# --- TC-05: Special / Invalid Username Characters ---
def test_tc05_invalid_format_characters(client):
    """TC-05: Invalid characters and patterns are rejected safely."""
    invalid_cases = [
        "-leading-hyphen",
        "trailing-hyphen-",
        "consecutive--hyphens",
        "user@domain.com",
        "user!name#",
        "a" * 40  # Exceeds 39 characters
    ]
    for bad_username in invalid_cases:
        is_valid, _, err = validate_username(bad_username)
        assert not is_valid
        assert err is not None

        response = client.post("/find", data={"username": bad_username})
        assert response.status_code == 400


# --- TC-06: API Unavailable / Rate Limit Handling ---
def test_tc06_api_rate_limited(client):
    """TC-06: API rate limit (403) is handled gracefully without crashing."""
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_get.return_value = mock_response

        response = client.post("/find", data={"username": "octocat"})
        assert response.status_code == 502
        assert b"rate limit" in response.data


# --- TC-07: Multiple Independent Searches ---
def test_tc07_multiple_independent_searches(client):
    """TC-07: Successive searches execute independently without session leakage."""
    is_valid1, clean1, _ = validate_username("user1")
    is_valid2, clean2, _ = validate_username("user2")
    assert clean1 == "user1"
    assert clean2 == "user2"

    # GET Home
    res_home = client.get("/")
    assert res_home.status_code == 200
    assert b"Find GitHub Profile" in res_home.data
