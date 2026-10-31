/* =========================================================
   PERI — Pop-up Pendaftaran Program
   Dipicu tombol [data-daftar-program] pada kartu program.
   Alur: belum masuk -> modal login (auth-modal.js) -> pop-up formulir
         -> POST /api/pendaftaran-program (peri-backend, port 5001)
         -> tampilan "berhasil" atau "sudah terdaftar".
   Desain: Figma node 160:169, 160:342, 160:418.
   ========================================================= */
(function () {
  "use strict";

  var API = "http://" + (location.hostname || "127.0.0.1") + ":5001";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PENDING_MS = 3 * 60 * 1000; // kartu yang menunggu login berlaku 3 menit

  var ICON = {
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18h.01"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  };
  function svg(name, sw) {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (sw || 1.8) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      ICON[name] +
      "</svg>"
    );
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

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

  /* ---------- Data program (dibaca dari kartu di halaman) ---------- */
  function infoDariKartu(card) {
    var img = card.querySelector("img");
    var p = card.querySelector(".pc-body p");
    return {
      nama: card.getAttribute("data-nama") || "",
      kategori: card.getAttribute("data-kategori") || "",
      deskripsi: p ? p.textContent.replace(/\s+/g, " ").trim() : "",
      gambar: img ? img.getAttribute("src") : "",
    };
  }
  function semuaProgram() {
    return Array.prototype.map.call(
      document.querySelectorAll(".program-card-full[data-nama]"),
      infoDariKartu,
    );
  }
  function cariProgram(nama) {
    var daftar = semuaProgram();
    for (var i = 0; i < daftar.length; i++) {
      if (daftar[i].nama === nama) return daftar[i];
    }
    return { nama: nama, kategori: "", deskripsi: "", gambar: "" };
  }

  /* ---------- Validasi (cermin dari aturan di server) ---------- */
  function normalkanWa(nilai) {
    var n = String(nilai || "").replace(/[\s\-().]/g, "");
    if (n.indexOf("+62") === 0) n = "0" + n.slice(3);
    else if (n.indexOf("62") === 0) n = "0" + n.slice(2);
    return /^08\d{8,12}$/.test(n) ? n : "";
  }

  /* ---------- Pop-up ---------- */
  var overlay, modal, lastFocus, tampilan;
  var ctx = { info: null, user: null };
  var pending = null;

  function pastikanDibangun() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "dp-overlay";
    overlay.hidden = true;
    modal = document.createElement("div");
    modal.className = "dp-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "dp-title");
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("mousedown", function (e) {
      // Formulir tidak ditutup lewat klik latar agar isian tidak hilang tak sengaja.
      if (e.target === overlay && tampilan !== "form") tutup();
    });
    modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-dp-close]")) tutup();
      else if (e.target.closest("[data-dp-lain]")) {
        tutup();
        var grid = document.getElementById("program-grid");
        if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    document.addEventListener("keydown", function (e) {
      if (overlay.hidden) return;
      if (e.key === "Escape") {
        tutup();
      } else if (e.key === "Tab") {
        var f = modal.querySelectorAll(
          "button:not([disabled]), input:not([readonly]):not([type=hidden]), select",
        );
        if (!f.length) return;
        var first = f[0];
        var last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  function buka(info, user) {
    pastikanDibangun();
    ctx.info = info;
    ctx.user = user;
    lastFocus = document.activeElement;
    renderForm();
    overlay.hidden = false;
    document.body.classList.add("dp-open");
  }

  function tutup() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("dp-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function kepala(eyebrow, judul) {
    return (
      '<div class="dp-accent"></div>' +
      '<div class="dp-head"><div>' +
      '<p class="dp-eyebrow">' +
      esc(eyebrow) +
      "</p>" +
      '<h2 class="dp-title" id="dp-title">' +
      esc(judul) +
      "</h2></div>" +
      '<button type="button" class="dp-close" data-dp-close aria-label="Tutup">' +
      svg("x") +
      "</button></div>"
    );
  }

  function field(id, label, opsi) {
    opsi = opsi || {};
    var kontrol;
    if (opsi.select) {
      kontrol =
        '<select id="' +
        id +
        '" name="' +
        id +
        '">' +
        opsi.select +
        "</select>" +
        '<span class="dp-ico">' +
        svg("chev") +
        "</span>";
    } else {
      kontrol =
        '<input id="' +
        id +
        '" name="' +
        id +
        '" type="' +
        (opsi.type || "text") +
        '" placeholder="' +
        esc(opsi.placeholder || "") +
        '" value="' +
        esc(opsi.value || "") +
        '" autocomplete="' +
        (opsi.ac || "off") +
        '"' +
        (opsi.readonly ? " readonly" : "") +
        (opsi.max ? ' maxlength="' + opsi.max + '"' : "") +
        " />" +
        (opsi.lock ? '<span class="dp-ico">' + svg("lock") + "</span>" : "");
    }
    return (
      '<div class="dp-field" data-field="' +
      id +
      '">' +
      '<label class="dp-label" for="' +
      id +
      '">' +
      esc(label) +
      (opsi.readonly ? "" : "<b>*</b>") +
      "</label>" +
      '<div class="dp-input">' +
      kontrol +
      "</div>" +
      (opsi.hint ? '<p class="dp-hint">' + esc(opsi.hint) + "</p>" : "") +
      '<p class="dp-error">' +
      svg("alert") +
      '<span data-msg></span></p></div>'
    );
  }

  /* --- 1. Formulir (Figma 160:169) --- */
  function renderForm() {
    tampilan = "form";
    var opsiProgram = semuaProgram()
      .map(function (p) {
        return (
          '<option value="' +
          esc(p.nama) +
          '"' +
          (p.nama === ctx.info.nama ? " selected" : "") +
          ">" +
          esc(p.nama) +
          "</option>"
        );
      })
      .join("");

    modal.innerHTML =
      kepala("Pendaftaran program", "Daftar Program") +
      '<form novalidate><div class="dp-body">' +
      '<div class="dp-alert err" data-alert hidden>' +
      svg("alert") +
      "<div data-alert-teks></div></div>" +
      field("dp-nama", "Nama lengkap", {
        placeholder: "Masukkan nama lengkap Anda",
        ac: "name",
        max: 100,
      }) +
      field("dp-email", "Email", {
        type: "email",
        placeholder: "email@gmail.com",
        value: ctx.user && ctx.user.email,
        ac: "email",
      }) +
      field("dp-wa", "Nomor WhatsApp", {
        type: "tel",
        placeholder: "08xxxxxxxxxx",
        ac: "tel",
        max: 20,
        hint: "Konfirmasi pendaftaran dikirim melalui WhatsApp.",
      }) +
      field("dp-program", "Program", { select: opsiProgram }) +
      '<div class="dp-field" data-field="dp-setuju">' +
      '<label class="dp-consent"><input type="checkbox" id="dp-setuju" />' +
      '<span class="dp-box">' +
      svg("check", 2.6) +
      "</span>" +
      "<span>Saya menyetujui data saya digunakan PERI untuk keperluan pendaftaran program ini.</span></label>" +
      '<p class="dp-error">' +
      svg("alert") +
      "<span data-msg></span></p></div>" +
      "</div>" +
      '<div class="dp-actions">' +
      '<button type="button" class="dp-btn ghost" data-dp-close>Batal</button>' +
      '<button type="submit" class="dp-btn primary">Kirim Pendaftaran ' +
      svg("arrow") +
      "</button></div></form>";

    var form = modal.querySelector("form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      kirim(form);
    });
    form.addEventListener("input", function (e) {
      var f = e.target.closest(".dp-field");
      if (f) f.classList.remove("has-error");
      banner(form, "");
    });
    form.addEventListener("change", function (e) {
      var f = e.target.closest(".dp-field");
      if (f) f.classList.remove("has-error");
    });
    var nama = document.getElementById("dp-nama");
    if (nama) nama.focus();
  }

  function banner(form, teks) {
    var b = form.querySelector("[data-alert]");
    b.hidden = !teks;
    b.querySelector("[data-alert-teks]").textContent = teks || "";
  }

  function galatKolom(form, id, pesan) {
    var f = form.querySelector('[data-field="' + id + '"]');
    if (!f) return;
    f.classList.add("has-error");
    f.querySelector("[data-msg]").textContent = pesan;
  }

  function validasi(form) {
    var v = function (id) {
      return document.getElementById(id).value.trim();
    };
    var salah = [];
    if (!v("dp-nama")) salah.push(["dp-nama", "Nama lengkap wajib diisi."]);
    if (!EMAIL_RE.test(v("dp-email")))
      salah.push(["dp-email", "Masukkan email yang valid."]);
    if (!normalkanWa(v("dp-wa")))
      salah.push([
        "dp-wa",
        "Nomor WhatsApp tidak valid. Gunakan angka, contoh 081234567890.",
      ]);
    if (!v("dp-program")) salah.push(["dp-program", "Pilih program."]);
    if (!document.getElementById("dp-setuju").checked)
      salah.push(["dp-setuju", "Centang persetujuan untuk melanjutkan."]);
    form.querySelectorAll(".has-error").forEach(function (f) {
      f.classList.remove("has-error");
    });
    salah.forEach(function (s) {
      galatKolom(form, s[0], s[1]);
    });
    if (salah.length) document.getElementById(salah[0][0]).focus();
    return salah.length === 0;
  }

  function kirim(form) {
    banner(form, "");
    if (!validasi(form)) return;
    var btn = form.querySelector(".dp-btn.primary");
    var labelAwal = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Mengirim…";
    var body = {
      program: document.getElementById("dp-program").value,
      nama: document.getElementById("dp-nama").value.trim(),
      email: document.getElementById("dp-email").value.trim(),
      wa: document.getElementById("dp-wa").value.trim(),
      setuju: document.getElementById("dp-setuju").checked,
    };
    api("/api/pendaftaran-program", "POST", body).then(function (r) {
      if (r.status === 201) {
        renderBerhasil(r.data.data || body);
        return;
      }
      if (r.status === 409) {
        renderSudahTerdaftar(r.data.data || body);
        return;
      }
      btn.disabled = false;
      btn.innerHTML = labelAwal;
      if (r.status === 401) {
        pending = { info: cariProgram(body.program), waktu: Date.now() };
        tutup();
        if (window.PERIAuth) window.PERIAuth.open("login");
        return;
      }
      var kolom = r.data && r.data.kolom;
      var peta = {
        nama: "dp-nama",
        email: "dp-email",
        wa: "dp-wa",
        program: "dp-program",
        setuju: "dp-setuju",
      };
      if (r.status === 400 && peta[kolom]) {
        galatKolom(form, peta[kolom], r.error);
        document.getElementById(peta[kolom]).focus();
      } else {
        banner(form, r.error);
      }
    });
  }

  /* --- 2. Sudah terdaftar (Figma 160:342) --- */
  function renderSudahTerdaftar(d) {
    tampilan = "duplikat";
    var p = cariProgram(d.program || ctx.info.nama);
    modal.innerHTML =
      kepala("Pendaftaran program", "Daftar Program") +
      '<div class="dp-body">' +
      '<div class="dp-alert warn" role="alert">' +
      svg("alert") +
      "<div><strong>Anda sudah terdaftar pada program ini</strong>" +
      "Pendaftaran ganda pada program yang sama tidak dapat dilakukan. " +
      "Pilih program lain atau hubungi PERI bila ada kendala.</div></div>" +
      '<div class="dp-program">' +
      (p.gambar ? '<img src="' + esc(p.gambar) + '" alt="" />' : "") +
      "<div>" +
      (p.kategori ? '<span class="dp-badge">' + esc(p.kategori) + "</span>" : "") +
      "<h3>" +
      esc(p.nama) +
      "</h3>" +
      (p.deskripsi ? "<p>" + esc(p.deskripsi) + "</p>" : "") +
      "</div></div>" +
      field("dp-nama", "Nama lengkap", { value: d.nama, readonly: true }) +
      field("dp-email", "Email", { value: d.email, readonly: true, lock: true }) +
      field("dp-wa", "Nomor WhatsApp", { value: d.wa, readonly: true }) +
      "</div>" +
      '<div class="dp-actions">' +
      '<button type="button" class="dp-btn ghost" data-dp-close>Tutup</button>' +
      '<button type="button" class="dp-btn primary" data-dp-lain>Lihat Program Lain ' +
      svg("arrow") +
      "</button></div>";
    modal.querySelector(".dp-btn.primary").focus();
  }

  /* --- 3. Berhasil (Figma 160:418) --- */
  function renderBerhasil(d) {
    tampilan = "berhasil";
    modal.innerHTML =
      kepala("Terima kasih", "Pendaftaran Terkirim") +
      '<div class="dp-body"><div class="dp-success">' +
      '<div class="dp-ok">' +
      svg("check", 2.4) +
      "</div>" +
      "<p>Pendaftaran Anda pada program " +
      esc(d.program) +
      " sudah kami terima. Tim PERI akan mengonfirmasi melalui WhatsApp.</p></div>" +
      '<div class="dp-summary">' +
      baris("Program", d.program) +
      baris("Nama", d.nama) +
      baris("Email", d.email) +
      baris("WhatsApp", d.wa) +
      "</div></div>" +
      '<div class="dp-actions">' +
      '<button type="button" class="dp-btn ghost" data-dp-lain>Lihat Program Lain</button>' +
      '<button type="button" class="dp-btn primary" data-dp-close>Selesai</button></div>';
    modal.querySelector(".dp-btn.primary").focus();
  }
  function baris(k, v) {
    return "<div><span>" + esc(k) + "</span><b>" + esc(v) + "</b></div>";
  }

  /* ---------- Pemicu ---------- */
  function mulai(info) {
    api("/api/auth/me", "GET").then(function (r) {
      if (r.ok && r.data && r.data.user) {
        buka(info, r.data.user);
        return;
      }
      pending = { info: info, waktu: Date.now() };
      if (window.PERIAuth) window.PERIAuth.open("login");
    });
  }

  document.addEventListener("click", function (e) {
    var tombol = e.target.closest && e.target.closest("[data-daftar-program]");
    if (!tombol) return;
    e.preventDefault();
    var kartu = tombol.closest(".program-card-full");
    if (kartu) mulai(infoDariKartu(kartu));
  });

  // Setelah login berhasil (dikirim oleh auth-modal.js), lanjutkan ke formulir.
  document.addEventListener("peri:login", function (e) {
    if (!pending || Date.now() - pending.waktu > PENDING_MS) {
      pending = null;
      return;
    }
    var info = pending.info;
    pending = null;
    buka(info, e.detail);
  });
})();