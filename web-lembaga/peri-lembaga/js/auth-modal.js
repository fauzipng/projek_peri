/* =========================================================
   PERI — Modal Masuk & Daftar
   Muncul di atas halaman saat tombol "Masuk" / "Daftar" diklik
   (tanpa pindah halaman). Desain: Figma node 1:839 (login) & 1:840 (register).
   ========================================================= */
(function () {
  "use strict";

  var EYE =
    '<svg viewBox="0 0 20 14" width="19" height="14" fill="none" stroke="#aaa" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 7s3.4-6 9-6 9 6 9 6-3.4 6-9 6S1 7 1 7z"/><circle cx="10" cy="7" r="2.6"/><line class="slash" x1="3" y1="13" x2="17" y2="1"/></svg>';
  var GOOGLE =
    '<svg viewBox="0 0 48 48" width="19" height="19" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';

  function field(id, type, placeholder, extra) {
    var isPw = type === "password";
    return (
      '<div class="auth-field" style="' +
      extra.style +
      '">' +
      '<input id="' +
      id +
      '" type="' +
      type +
      '" placeholder="' +
      placeholder +
      '" autocomplete="' +
      (extra.ac || "off") +
      '"' +
      (isPw ? ' class="has-eye"' : "") +
      ">" +
      (isPw
        ? '<button type="button" class="auth-eye" data-eye="' +
          id +
          '" aria-label="Tampilkan atau sembunyikan kata sandi">' +
          EYE +
          "</button>"
        : "") +
      (extra.resend
        ? '<button type="button" class="auth-resend">Resend</button>'
        : "") +
      "</div>"
    );
  }

  function header(top) {
    return (
      '<div class="auth-header" style="top:' +
      top +
      'px">' +
      '<img class="auth-logo" src="assets/auth/logo-peri.png" alt="" onerror="this.onerror=null;this.classList.add(\'is-fallback\');this.src=\'assets/logo.svg\'">' +
      '<div class="auth-brand"><span>Perempuan</span><span>Kreatif</span><span>Indonesia</span></div></div>'
    );
  }

  function silhouettes(top) {
    return (
      '<div class="auth-sil auth-sil-l" style="top:' +
      top +
      'px"></div><div class="auth-sil auth-sil-r" style="top:' +
      (top - 2) +
      'px"></div>'
    );
  }

  var LOGIN_HTML =
    '<div class="auth-card auth-card-login" data-view="login" role="dialog" aria-modal="true" aria-labelledby="auth-title-login">' +
    header(0) +
    silhouettes(83) +
    '<p class="auth-title" id="auth-title-login" style="top:117px">Account Log In</p>' +
    '<form class="auth-form" novalidate data-form="login">' +
    field("auth-l-email", "email", "Email", {
      style: "top:149px",
      ac: "email",
    }) +
    field("auth-l-pass", "password", "Enter password", {
      style: "top:210px",
      ac: "current-password",
    }) +
    '<p class="auth-msg" style="top:253px" role="alert"></p>' +
    '<button type="submit" class="auth-submit" style="top:273px">Log In</button>' +
    "</form>" +
    '<button type="button" class="auth-link" style="left:62px;top:312px" data-go="register">Register Now</button>' +
    '<button type="button" class="auth-link" style="left:187px;top:312px" data-nolink>Forgot Password?</button>' +
    '<p class="auth-more" style="top:351px">More Login Methods</p>' +
    '<button type="button" class="auth-google" style="top:369px" aria-label="Masuk dengan Google" data-nolink>' +
    GOOGLE +
    "</button>" +
    "</div>";

  var REGISTER_HTML =
    '<div class="auth-card auth-card-register" data-view="register" role="dialog" aria-modal="true" aria-labelledby="auth-title-register">' +
    header(25) +
    silhouettes(164) +
    '<p class="auth-title" id="auth-title-register" style="top:113px">Register</p>' +
    '<form class="auth-form" novalidate data-form="register">' +
    field("auth-r-email", "email", "Email", {
      style: "top:137px",
      ac: "email",
    }) +
    field("auth-r-code", "text", "Verification Code", {
      style: "top:192px",
      resend: true,
    }) +
    field("auth-r-pass", "password", "Enter password", {
      style: "top:247px",
      ac: "new-password",
    }) +
    field("auth-r-pass2", "password", "Confirm password", {
      style: "top:302px",
      ac: "new-password",
    }) +
    '<p class="auth-msg" style="top:341px" role="alert"></p>' +
    '<button type="submit" class="auth-submit" style="top:360px">Log In</button>' +
    "</form>" +
    '<p class="auth-have" style="top:401px">Already have an account? <button type="button" class="auth-link-inline" data-go="login">Log In</button></p>' +
    '<p class="auth-more" style="top:442px">More Login Methods</p>' +
    '<button type="button" class="auth-google" style="top:463px" aria-label="Daftar dengan Google" data-nolink>' +
    GOOGLE +
    "</button>" +
    "</div>";

  var overlay, lastFocus;

  /* ---------- Hubungan ke API autentikasi (peri-backend, port 5001) ---------- */
  var API = "http://" + (location.hostname || "127.0.0.1") + ":5001";
  var ADMIN_URL = "../peri-admin/dashboard.html";

  function api(path, method, body) {
    return fetch(API + path, {
      method: method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            return {
              ok: res.ok,
              status: res.status,
              data: data,
              error: data.error || "Terjadi kesalahan. Coba lagi.",
            };
          });
      })
      .catch(function () {
        return {
          ok: false,
          status: 0,
          data: {},
          error: "Server belum aktif. Jalankan peri-backend (python app.py).",
        };
      });
  }

  function val(form, sel) {
    return form.querySelector(sel).value.trim();
  }

  function setMsg(el, text, ok) {
    el.className = "auth-msg" + (ok ? " ok" : "");
    el.textContent = text;
  }

  // Setelah login/registrasi berhasil: admin -> web admin, pendaftar tetap di web lembaga.
  function afterAuth(user) {
    if (user.role === "admin") {
      location.href = ADMIN_URL;
      return;
    }
    close();
    renderNavbar(user);
    // Memberi tahu skrip lain (mis. pop-up Daftar Program) bahwa login berhasil.
    document.dispatchEvent(new CustomEvent("peri:login", { detail: user }));
  }

  // Ganti tombol Masuk/Daftar dengan Keluar saat sudah login.
  function renderNavbar(user) {
    var box = document.querySelector(".navbar-actions");
    if (!box) return;
    box.innerHTML = "";
    if (user.role === "admin") {
      var panel = document.createElement("a");
      panel.href = ADMIN_URL;
      panel.className = "btn btn-primary";
      panel.textContent = "Panel Admin";
      box.appendChild(panel);
    }
    var out = document.createElement("a");
    out.href = "#";
    out.className = "btn btn-outline";
    out.textContent = "Keluar";
    out.title = user.email;
    out.addEventListener("click", function (e) {
      e.preventDefault();
      api("/api/auth/logout", "POST").then(function () {
        location.reload();
      });
    });
    box.appendChild(out);
  }

  function restoreSession() {
    api("/api/auth/me", "GET").then(function (r) {
      if (r.ok) renderNavbar(r.data.user);
    });
  }

  function resendCode(btn) {
    var form = btn.closest("form");
    var msg = form.querySelector(".auth-msg");
    var email = val(form, "#auth-r-email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg(msg, "Masukkan email yang valid.");
      return;
    }
    btn.disabled = true;
    api("/api/auth/kirim-kode", "POST", { email: email }).then(function (r) {
      setMsg(
        msg,
        r.ok ? r.data.pesan || "Kode verifikasi dikirim." : r.error,
        r.ok,
      );
      setTimeout(
        function () {
          btn.disabled = false;
        },
        r.ok ? 60000 : 2000,
      );
    });
  }

  function build() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "auth-overlay";
    overlay.hidden = true;
    overlay.innerHTML = LOGIN_HTML + REGISTER_HTML;
    document.body.appendChild(overlay);

    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) close();
    });

    overlay.addEventListener("click", function (e) {
      var go = e.target.closest("[data-go]");
      if (go) {
        show(go.getAttribute("data-go"));
        return;
      }
      var rs = e.target.closest(".auth-resend");
      if (rs) {
        resendCode(rs);
        return;
      }
      var eye = e.target.closest("[data-eye]");
      if (eye) {
        var inp = document.getElementById(eye.getAttribute("data-eye"));
        var showPw = inp.type === "password";
        inp.type = showPw ? "text" : "password";
        eye.classList.toggle("on", showPw);
      }
    });

    overlay.querySelectorAll("form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var msg = form.querySelector(".auth-msg");
        var err = validate(form);
        if (err) {
          setMsg(msg, err);
          return;
        }
        var type = form.getAttribute("data-form");
        var btn = form.querySelector(".auth-submit");
        var body =
          type === "login"
            ? {
                email: val(form, "#auth-l-email"),
                password: form.querySelector("#auth-l-pass").value,
              }
            : {
                email: val(form, "#auth-r-email"),
                kode: val(form, "#auth-r-code"),
                password: form.querySelector("#auth-r-pass").value,
              };
        btn.disabled = true;
        api("/api/auth/" + type, "POST", body).then(function (r) {
          btn.disabled = false;
          if (!r.ok) {
            setMsg(msg, r.error);
            return;
          }
          afterAuth(r.data.user);
        });
      });
      form.addEventListener("input", function () {
        var m = form.querySelector(".auth-msg");
        m.textContent = "";
        m.className = "auth-msg";
      });
    });
  }

  function validate(form) {
    var type = form.getAttribute("data-form");
    var v = function (s) {
      return form.querySelector(s).value.trim();
    };
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (type === "login") {
      if (!emailRe.test(v("#auth-l-email")))
        return "Masukkan email yang valid.";
      if (!v("#auth-l-pass")) return "Masukkan kata sandi.";
    } else {
      if (!emailRe.test(v("#auth-r-email")))
        return "Masukkan email yang valid.";
      if (!v("#auth-r-code")) return "Masukkan kode verifikasi.";
      var p = form.querySelector("#auth-r-pass").value;
      if (p.length < 8 || p.length > 30) return "Kata sandi 8–30 karakter.";
      if (p !== form.querySelector("#auth-r-pass2").value)
        return "Kata sandi tidak sama.";
    }
    return "";
  }

  function show(view) {
    overlay.querySelectorAll(".auth-card").forEach(function (c) {
      c.hidden = c.getAttribute("data-view") !== view;
    });
    var first = overlay.querySelector(
      '.auth-card[data-view="' + view + '"] input',
    );
    if (first) first.focus();
  }

  function open(view) {
    build();
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("auth-open");
    show(view);
  }

  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("auth-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  // Tombol/tautan yang mengarah ke login.html / register.html membuka modal.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (/(^|\/)login\.html$/.test(href)) {
      e.preventDefault();
      open("login");
    } else if (/(^|\/)register\.html$/.test(href)) {
      e.preventDefault();
      open("register");
    }
  });

  restoreSession();

  window.PERIAuth = { open: open, close: close };
})();