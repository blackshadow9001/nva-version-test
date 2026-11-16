/* NVA Pet Care — login sample pages. Vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* ---------- Toasts ---------- */
  var region = document.querySelector(".toast-region");
  function toast(message) {
    if (!region) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    region.appendChild(el);
    setTimeout(function () {
      el.classList.add("is-leaving");
      setTimeout(function () { el.remove(); }, 200);
    }, 2800);
  }

  // Any element with data-toast shows its message instead of navigating.
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toast]");
    if (!t) return;
    e.preventDefault();
    toast(t.getAttribute("data-toast"));
  });

  /* ---------- Sign-in page ---------- */
  var form = document.getElementById("signin-form");
  if (form) initSignIn();

  function initSignIn() {
    var params = new URLSearchParams(location.search);
    // ?entry=returning shows the remembered-user state; default is a new visitor (matches the canvas default).
    var mode = params.get("entry") === "returning" ? "returning" : "new";

    var email = document.getElementById("email");
    var password = document.getElementById("password");
    var submit = document.getElementById("submit");
    var alertBox = document.getElementById("form-alert");

    function setMode(next) {
      mode = next;
      document.querySelectorAll("[data-show]").forEach(function (el) {
        el.hidden = el.getAttribute("data-show") !== mode;
      });
      email.disabled = mode !== "new";
      password.autocomplete = "current-password";
      clearErrors();
    }

    function showError(input, message) {
      var err = document.getElementById(input.id + "-error");
      input.setAttribute("aria-invalid", "true");
      err.textContent = message;
      err.hidden = false;
    }
    function clearError(input) {
      var err = document.getElementById(input.id + "-error");
      input.removeAttribute("aria-invalid");
      err.hidden = true;
    }
    function clearErrors() {
      clearError(email);
      clearError(password);
      alertBox.hidden = true;
    }

    function validate() {
      var ok = true;
      var first = null;
      if (mode === "new") {
        var v = email.value.trim();
        if (!v) { showError(email, "Enter your email address."); ok = false; first = first || email; }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { showError(email, "Enter an email like name@example.com."); ok = false; first = first || email; }
        else clearError(email);
      }
      if (!password.value) { showError(password, "Enter your password."); ok = false; first = first || password; }
      else if (password.value.length < 8) { showError(password, "Passwords are at least 8 characters."); ok = false; first = first || password; }
      else clearError(password);
      if (first) first.focus();
      return ok;
    }

    function setLoading(btn, loading, label) {
      btn.disabled = loading;
      if (loading) {
        btn.dataset.label = btn.textContent;
        btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + (label || "Signing in…");
      } else if (btn.dataset.label) {
        btn.textContent = btn.dataset.label;
      }
    }

    function goHome() {
      location.href = "home.html";
    }

    // Clear an error as soon as the user fixes the field.
    [email, password].forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") clearError(input);
        alertBox.hidden = true;
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;
      setLoading(submit, true);
      // Simulated request. Swap for a real fetch() to your auth endpoint.
      setTimeout(goHome, 700);
    });

    document.getElementById("not-you").addEventListener("click", function () {
      setMode("new");
      history.replaceState(null, "", location.pathname);
      email.focus();
    });

    // Show / hide password
    var reveal = document.getElementById("reveal");
    reveal.addEventListener("click", function () {
      var show = password.type === "password";
      password.type = show ? "text" : "password";
      reveal.setAttribute("aria-pressed", String(show));
      reveal.setAttribute("aria-label", show ? "Hide password" : "Show password");
      reveal.innerHTML = window.Icons.svg(show ? "eye-off" : "eye", 16);
      password.focus();
    });

    // Social sign-in (simulated)
    document.querySelectorAll("[data-sso]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLoading(btn, true, "Connecting to " + btn.dataset.sso + "…");
        setTimeout(goHome, 900);
      });
    });

    setMode(mode);
  }

  /* ---------- Home page ---------- */
  var greeting = document.getElementById("greeting");
  if (greeting) initHome();

  function initHome() {
    var h = new Date().getHours();
    greeting.textContent = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

    // Bottom tabs: only Home exists in this prototype; others move the highlight and explain.
    var tabs = document.querySelectorAll(".tabbar a");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        tabs.forEach(function (t) { t.removeAttribute("aria-current"); });
        tab.setAttribute("aria-current", "page");
        if (tab.getAttribute("href") !== "#home") {
          toast(tab.textContent.trim() + " isn't part of this prototype yet.");
        }
      });
    });

    // Add to calendar: downloads an .ics file for the visit.
    document.getElementById("add-to-calendar").addEventListener("click", function () {
      var ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//NVA Pet Care//Prototype//EN",
        "BEGIN:VEVENT",
        "UID:waffles-checkup-20261112@nva-prototype",
        "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
        "DTSTART:20261112T093000",
        "DTEND:20261112T101500",
        "SUMMARY:Waffles: annual check-up with Dr. Patel",
        "LOCATION:Vaughan Animal Hospital",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
      var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
      var a = document.createElement("a");
      a.href = url;
      a.download = "waffles-check-up.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast("Calendar file downloaded.");
    });
  }
})();
