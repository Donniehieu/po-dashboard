// ==UserScript==
// @name         Odoo Helper + Zalo (mồi tải bản mới nhất từ dashboard, tự điền tin vào Zalo Web)
// @namespace    https://github.com/Donniehieu
// @version      2.1.2
// @description  Trên Odoo: tự chạy Odoo Helper (mã nằm trong dashboard, không cần cập nhật). Trên Zalo Web: nhận tin "nhắn Zalo thủ kho" từ Odoo và tự điền vào ô chat (không tự gửi, bạn bấm Enter).
// @match        https://erp.dekko.com.vn/*
// @match        https://chat.zalo.me/*
// @match        https://zalo.me/*
// @updateURL    https://donniehieu.github.io/po-dashboard/odoo-helper.user.js
// @downloadURL  https://donniehieu.github.io/po-dashboard/odoo-helper.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function () {
  "use strict";
  var host = location.hostname;

  /* ===== 1) Trang Odoo: nạp Odoo Helper từ dashboard (tải lại mỗi giờ) ===== */
  if (host === "erp.dekko.com.vn") {
    var s = document.createElement("script");
    s.src = "https://donniehieu.github.io/po-dashboard/odoo-helper.js?v=" + Math.floor(Date.now() / 3e5); // lấy bản mới nhất mỗi 5 phút
    document.documentElement.appendChild(s);
    return;
  }

  /* ===== 2) Zalo Web: nhận tin từ Odoo và điền vào ô chat. KHÔNG tự gửi: bạn kiểm tra rồi bấm Enter. =====
     Mã nằm ngay trong script này (không tải từ ngoài) vì Zalo có thể chặn script lạ. Tin chỉ nhận từ tab Odoo (https://erp.dekko.com.vn). */
  var ERP = "https://erp.dekko.com.vn";
  var pending = null, filled = {}, note = null, pullTimer = 0, scanTimer = 0, t0 = Date.now();

  function vis(e) { return !!e && (e.offsetParent !== null || e.getClientRects().length > 0); }
  function composer() { // ô soạn tin: ưu tiên id quen thuộc của Zalo Web, nếu không thì ô contenteditable thấp nhất, rộng nhất trên màn hình
    var byId = document.querySelector("#input_line_0, #richInput [contenteditable='true'], [id^='input_line'][contenteditable='true']");
    if (byId && vis(byId)) return byId;
    var c = [].slice.call(document.querySelectorAll("[contenteditable='true']")).filter(function (e) {
      var r = e.getBoundingClientRect();
      return vis(e) && r.width > 200 && r.bottom > window.innerHeight * 0.5;
    });
    c.sort(function (a, b) { return b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom; });
    return c[0] || null;
  }
  function chip(html, bad) {
    if (!note) {
      note = document.createElement("div");
      note.style.cssText = "position:fixed;left:14px;bottom:14px;z-index:2147483647;max-width:340px;background:#fff;color:#222;border:1px solid #bbb;border-radius:10px;padding:10px 12px;box-shadow:0 4px 18px rgba(0,0,0,.28);font:13px/1.45 system-ui,Segoe UI,sans-serif";
      document.body.appendChild(note);
    }
    note.style.borderColor = bad ? "#c62828" : "#2e7d32";
    note.innerHTML = html;
    return note;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function insert(el, text) { // chèn vào cuối ô chat bằng thao tác nhập liệu của trình duyệt để Zalo nhận ra
    el.focus();
    var sel = window.getSelection(), r = document.createRange();
    r.selectNodeContents(el); r.collapse(false); sel.removeAllRanges(); sel.addRange(r);
    var ok = false;
    try { ok = document.execCommand("insertText", false, text); } catch (e) {}
    if (!ok || (el.textContent || "").indexOf(text) < 0) {
      try {
        var dt = new DataTransfer(); dt.setData("text/plain", text);
        el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
      } catch (e) {}
    }
    return (el.textContent || "").indexOf(text) >= 0;
  }
  function doFill(el) { // chèn tin vào ô chat rồi báo kết quả
    if (insert(el, pending.text)) {
      filled[pending.id] = 1;
      chip("✅ Đã điền tin vào ô chat" + (pending.to ? " (gửi cho <b>" + esc(pending.to) + "</b>)" : "") + ": <i>" + esc(pending.text) + "</i><br><small>Kiểm tra đúng người nhận rồi bấm <b>Enter</b> để gửi.</small>");
      setTimeout(function () { if (note) { note.remove(); note = null; } }, 20000);
    } else {
      chip("⚠ Không điền tự động được. Tin đã được sao chép: bấm vào ô chat rồi <b>Ctrl+V</b>.<br><i>" + esc(pending.text) + "</i><br><button id='qz-paste' style='margin-top:6px;padding:5px 10px;border:1px solid #888;border-radius:6px;background:#f5f5f5;cursor:pointer'>Dán từ bộ nhớ tạm</button>", true);
      var b = document.getElementById("qz-paste");
      if (b) b.onclick = function () {
        navigator.clipboard.readText().then(function (t) { var e2 = composer(); if (e2 && t) { insert(e2, t); filled[pending.id] = 1; } }).catch(function () {});
      };
      filled[pending.id] = 1; // không thử lại liên tục
    }
  }
  function tryFill() {
    if (!pending || filled[pending.id]) return;
    if (Date.now() - pending.at > 10 * 60 * 1000) { pending = null; return; } // tin chờ quá 10 phút thì bỏ
    if (pending.manual) { // không có số điện thoại (dùng chat cũ): chỉ điền khi bạn bấm nút, để không điền nhầm vào cuộc trò chuyện đang mở
      if (!pending.shown) {
        pending.shown = 1;
        chip("💬 Tin gửi <b>" + esc(pending.to || "Thủ kho") + "</b>: <i>" + esc(pending.text) + "</i><br><small>Mở <b>chat cũ</b> với người này trong Zalo, rồi bấm nút bên dưới.</small><br><button id='qz-go' style='margin-top:6px;padding:6px 10px;border:0;border-radius:6px;background:#1565c0;color:#fff;font-weight:700;cursor:pointer'>✍ Điền vào cuộc trò chuyện đang mở</button>");
        var g = document.getElementById("qz-go");
        if (g) g.onclick = function () {
          var el = composer();
          if (!el) { g.textContent = "Chưa thấy ô chat: hãy mở cuộc trò chuyện trước"; return; }
          doFill(el);
        };
      }
      return;
    }
    var el = composer();
    if (!el) { chip("⏳ Tin gửi Thủ kho đang chờ: <i>" + esc(pending.text) + "</i><br><small>Hãy mở cuộc trò chuyện với Thủ kho, tin sẽ tự điền vào ô chat.</small>"); return; }
    doFill(el);
  }
  window.addEventListener("message", function (e) {
    if (e.origin !== ERP) return;
    var d = e.data;
    if (!d || d.qlcvz !== "fill" || typeof d.text !== "string" || !d.text || d.text.length > 600) return;
    if (filled[d.id] || (pending && pending.id === d.id)) return;
    pending = { id: d.id, text: d.text, at: Date.now(), to: typeof d.to === "string" ? d.to.slice(0, 80) : "", manual: !!d.manual };
    tryFill();
  });
  // Zalo Web do Odoo mở ra có window.opener: chủ động xin tin (phòng khi tin đẩy sang lúc trang còn đang nạp/đăng nhập)
  pullTimer = setInterval(function () {
    if (pending || Date.now() - t0 > 5 * 60 * 1000) { clearInterval(pullTimer); return; }
    try { if (window.opener && !window.opener.closed) window.opener.postMessage({ qlcvz: "req" }, ERP); } catch (e) {}
  }, 2500);
  scanTimer = setInterval(tryFill, 1000); // ô chat chỉ xuất hiện khi đã mở một cuộc trò chuyện
})();
