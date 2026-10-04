/**
 * GitHub Username Finder & Redirector - Client Logic
 */
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("finder-form");
    const input = document.getElementById("username");
    const validationError = document.getElementById("validation-error");
    const submitBtn = document.getElementById("submit-btn");
    const sampleBtns = document.querySelectorAll(".sample-btn");

    // Quick sample username filler
    sampleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const user = btn.getAttribute("data-user");
            if (input && user) {
                input.value = user;
                input.focus();
                if (validationError) validationError.style.display = "none";
            }
        });
    });

    if (form && input) {
        form.addEventListener("submit", (e) => {
            const rawValue = input.value;
            const trimmed = rawValue.trim();

            if (!trimmed) {
                e.preventDefault();
                showError("Please enter a GitHub username.");
                input.focus();
                return;
            }

            // GitHub username format validation
            const githubRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
            if (!githubRegex.test(trimmed)) {
                e.preventDefault();
                showError("Invalid username format. Use alphanumeric characters and single non-adjacent hyphens.");
                input.focus();
                return;
            }

            // Clean input
            input.value = trimmed;

            // Loading state
            if (submitBtn) {
                const btnText = submitBtn.querySelector(".btn-text");
                const btnSpinner = submitBtn.querySelector(".btn-spinner");
                if (btnText && btnSpinner) {
                    btnText.style.display = "none";
                    btnSpinner.style.display = "inline";
                }
                submitBtn.disabled = true;
            }
        });

        input.addEventListener("input", () => {
            if (validationError) {
                validationError.style.display = "none";
            }
        });
    }

    function showError(msg) {
        if (validationError) {
            validationError.textContent = msg;
            validationError.style.display = "block";
        }
    }
});
