/* Odoo Helper v1.4.1 - tự điền thụ hưởng NCC + nhắc kế toán trong Chatter (tin mẫu, nhật ký tin đã gửi).
   Chạy bằng nút bookmark trên trang Odoo (không cần Tampermonkey). File này nằm trong dashboard nên luôn là bản mới nhất.
   Dữ liệu NCC và nhật ký lưu trong trình duyệt (localStorage của trang Odoo), không gửi đi đâu ngoài tab dashboard đã mở trang này. */
(function () {
  "use strict";
  // Bấm lại nút bookmark khi script đã chạy: chỉ mở lại khung (không chạy hai lần)
  if (window.__qlcvHelper) { const b = document.getElementById("nccaf"); if (b) { b.style.display = ""; b.classList.remove("min"); } else window.__qlcvHelper.hint(); return; }
  window.__qlcvHelper = { hint: () => hintNote() };
  const DB_KEY = "ncc_bank_db_v1", CFG_KEY = "ncc_bank_cfg_v1";
  const PATH_RE = /\/odoo\/(vendor-payments|vendor-bills|action-\d+|purchase)\//; // phiếu thanh toán NCC hoặc đơn mua (PO)
  // Phiếu thanh toán: mở trực tiếp (/odoo/vendor-payments/…) hoặc từ PO bằng nút “Trả trước” (/odoo/action-…/<PO>/account.payment/<id>)
  const isPayRecord = () => /\/odoo\/vendor-payments\//.test(location.pathname) || /\/account\.payment\/(\d+|new)/.test(location.pathname);
  const isPayPage = isPayRecord;
  // Có đủ 3 ô thụ hưởng đang hiện trên màn hình (phiếu thanh toán, hộp thoại, hay tab “Thông tin thụ hưởng” của PO) thì hiện phần tự điền
  function hasBenef() { const v = (e) => !!e && (e.offsetParent !== null || e.getClientRects().length > 0); return v($(SEL.acc)) && v($(SEL.holder)) && v($(SEL.bank)); }
  const canFill = () => isPayRecord() || hasBenef();
  const SEL = {
    acc: '[id^="x_beneficiary_account_number"], [name="x_beneficiary_account_number"] input',
    holder: '[id^="x_beneficiary_name"], [name="x_beneficiary_name"] input',
    bank: '[id^="x_beneficiary_bank_id"], [name="x_beneficiary_bank_id"] input',
    partner: '[name="partner_id"] input, input[id^="partner_id"]',
  };

  /* ---------- lưu trữ ---------- */
  const st = {
    get(k, d) { try { const v = typeof GM_getValue === "function" ? GM_getValue(k) : localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { const s = JSON.stringify(v); try { typeof GM_setValue === "function" ? GM_setValue(k, s) : localStorage.setItem(k, s); } catch (e) {} },
  };
  const loadDb = () => st.get(DB_KEY, { version: 1, updated: null, items: [] });
  const saveDb = (items) => st.set(DB_KEY, { version: 1, updated: new Date().toISOString(), items });
  /* Dữ liệu tab "Thông tin thanh toán" của dashboard (ngân hàng, số tài khoản; checked = đã tick "Đã kiểm tra thông tin") */
  const BANK_KEY = "qlcv_bankinfo_v1";
  const loadBank = () => st.get(BANK_KEY, { updated: null, items: [] });
  const cfg = () => ({ auto: false, overwrite: false, ...st.get(CFG_KEY, {}) });

  /* ---------- chuẩn hóa tên để so khớp ---------- */
  const fold = (s) => String(s == null ? "" : s).toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "");
  const ABBR = { sx: "san xuat", tm: "thuong mai", dv: "dich vu", xnk: "xuat nhap khau", kt: "ky thuat", cn: "cong nghe", cp: "co phan", tnhh: "", mtv: "", co: "", ltd: "", jsc: "", cty: "", dttm: "dau tu thuong mai", tmdv: "thuong mai dich vu", ct: "" };
  const PHRASES = ["ho kinh doanh", "cong ty", "trach nhiem huu han", "mot thanh vien", "co phan", "chi nhanh", "van phong dai dien", "xuong", "cn"];
  const STOP = new Set(["va", "cua", "tai", ""]);
  const GENERIC = new Set("thiet bi ky thuat thuong mai dich vu san xuat cong nghe nghiep dau tu viet nam ha noi sai gon hcm hai phong duong giai phap he thong may moc co khi dien nuoc xay dung van tai tin hoc tong hop quoc te phat trien xuat nhap khau in truyen thong nhua thep".split(" "));
  function core(s) {
    let t = fold(s).replace(/\([^)]*\)/g, " ").replace(/[^\w\s&]/g, " ").replace(/&/g, " va ");
    t = " " + t.split(/\s+/).filter(Boolean).join(" ") + " ";
    for (const p of PHRASES) t = t.split(" " + p + " ").join(" ");
    const out = new Set();
    for (const w of t.split(/\s+/)) for (const x of (ABBR[w] !== undefined ? ABBR[w] : w).split(" ")) if (!STOP.has(x)) out.add(x);
    return out;
  }
  const subset = (a, b) => { for (const x of a) if (!b.has(x)) return false; return true; };
  const inter = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n; };
  const minus = (a, g) => new Set([...a].filter((x) => !g.has(x)));
  const sameSet = (a, b) => a.size === b.size && subset(a, b);
  function cands(name) { // bỏ mã đầu dòng (XHN-, X-...) và ghi chú sau " - "
    const raw = String(name);
    const s = raw.replace(/^\s*x[a-z0-9]{0,10}\s*[-–]\s*/i, "");
    const segs = s.split(/\s+[-–]\s*|\s*[-–]\s+/).filter((x) => x.trim());
    const out = [];
    for (let k = 1; k <= Math.max(1, segs.length); k++) out.push(core((segs.length ? segs : [s]).slice(0, k).join(" ")));
    (raw.match(/\(([^)]*)\)/g) || []).forEach((m) => out.push(core(m.slice(1, -1))));
    out.push(core(s));
    return out.filter((c) => c.size);
  }
  function findSupplier(name, items) { // -> {hits:[item], how}
    const p = core(name);
    if (!p.size) return { hits: [], how: null };
    const idx = items.map((it) => ({ it, cs: cands(it.name) }));
    let hits = idx.filter((x) => x.cs.some((c) => sameSet(c, p))).map((x) => x.it);
    if (hits.length) return { hits, how: "exact" };
    hits = idx.filter((x) => x.cs.some((c) => {
      const [a, b] = p.size <= c.size ? [p, c] : [c, p];
      const da = minus(a, GENERIC);
      return da.size && subset(da, minus(b, GENERIC)) && inter(a, b) >= 2 && inter(a, b) / a.size >= 0.8;
    })).map((x) => x.it);
    return { hits, how: hits.length ? "fuzzy" : null };
  }

  /* ---------- đọc / ghi .xlsx tối giản (không thư viện) ---------- */
  const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (b) => { let c = -1; for (let i = 0; i < b.length; i++) c = (c >>> 8) ^ CRC_T[(c ^ b[i]) & 255]; return (c ^ -1) >>> 0; };
  function zipRead(buf) {
    const u8 = new Uint8Array(buf), dv = new DataView(buf);
    let e = u8.length - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new Error("Không phải file .xlsx hợp lệ");
    const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const by = {};
    for (let i = 0; i < n; i++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
      by[new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl))] = { method: dv.getUint16(p + 10, true), csize: dv.getUint32(p + 20, true), off: dv.getUint32(p + 42, true) };
      p += 46 + nl + el + cl;
    }
    return { names: Object.keys(by), async get(name) {
      const f = by[name]; if (!f) return null;
      const st0 = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true), data = u8.subarray(st0, st0 + f.csize);
      if (f.method === 0) return new TextDecoder().decode(data);
      return await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
    } };
  }
  function zipStored(files) {
    const enc = new TextEncoder(), parts = [], cds = []; let pos = 0;
    for (const [name, txt] of files) {
      const nb = enc.encode(name), data = enc.encode(txt), crc = crc32(data);
      const lh = new Uint8Array(30 + nb.length), l = new DataView(lh.buffer);
      l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true); l.setUint16(6, 0x0800, true); l.setUint32(14, crc, true); l.setUint32(18, data.length, true); l.setUint32(22, data.length, true); l.setUint16(26, nb.length, true); lh.set(nb, 30);
      const cd = new Uint8Array(46 + nb.length), c = new DataView(cd.buffer);
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, pos, true); cd.set(nb, 46);
      parts.push(lh, data); pos += lh.length + data.length; cds.push(cd);
    }
    let sz = 0; for (const c of cds) { parts.push(c); sz += c.length; }
    const eo = new Uint8Array(22), d = new DataView(eo.buffer);
    d.setUint32(0, 0x06054b50, true); d.setUint16(8, cds.length, true); d.setUint16(10, cds.length, true); d.setUint32(12, sz, true); d.setUint32(16, pos, true); parts.push(eo);
    return new Blob(parts, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  const xe = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  const colL = (i) => String.fromCharCode(65 + i);
  const HEAD = ["Tên NCC", "Số tài khoản", "Tên người thụ hưởng", "Ngân hàng thụ hưởng"];
  function makeXlsx(items, note) {
    const H = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n', NS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
    const cell = (r, c, v, s) => `<c r="${colL(c)}${r}" t="inlineStr"${s ? ' s="1"' : ""}><is><t xml:space="preserve">${xe(v)}</t></is></c>`;
    const rows = [`<row r="1">${HEAD.map((h, c) => cell(1, c, h, 1)).join("")}</row>`];
    items.forEach((it, i) => rows.push(`<row r="${i + 2}">${[it.name, it.acc, it.holder, it.bank].map((v, c) => (v == null || v === "") ? "" : cell(i + 2, c, v)).join("")}</row>`));
    if (note) rows[1] = (rows[1] || '<row r="2"></row>').replace("</row>", cell(2, 5, note) + "</row>");
    const files = [
      ["[Content_Types].xml", H + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
      ["_rels/.rels", H + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ["xl/workbook.xml", H + `<workbook ${NS} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="NCC" sheetId="1" r:id="rId1"/></sheets></workbook>`],
      ["xl/_rels/workbook.xml.rels", H + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
      ["xl/styles.xml", H + `<styleSheet ${NS}><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`],
      ["xl/worksheets/sheet1.xml", H + `<worksheet ${NS}><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="60" customWidth="1"/><col min="2" max="2" width="22" customWidth="1"/><col min="3" max="3" width="60" customWidth="1"/><col min="4" max="4" width="50" customWidth="1"/><col min="6" max="6" width="70" customWidth="1"/></cols><sheetData>${rows.join("")}</sheetData></worksheet>`],
    ];
    return zipStored(files);
  }
  async function readXlsx(buf) { // -> mảng các dòng (mỗi dòng là mảng chuỗi) của sheet đầu tiên
    const z = zipRead(buf), P = (t) => new DOMParser().parseFromString(t, "application/xml");
    const sst = [], sT = await z.get("xl/sharedStrings.xml");
    if (sT) for (const si of P(sT).getElementsByTagName("si")) { let s = ""; for (const t of si.getElementsByTagName("t")) if (t.parentNode.nodeName !== "rPh") s += t.textContent; sst.push(s); }
    const wb = P(await z.get("xl/workbook.xml")), rel = P(await z.get("xl/_rels/workbook.xml.rels")), rels = {};
    for (const r of rel.getElementsByTagName("Relationship")) rels[r.getAttribute("Id")] = r.getAttribute("Target");
    const sh = wb.getElementsByTagName("sheet")[0]; let tgt = rels[sh.getAttribute("r:id")] || "worksheets/sheet1.xml";
    tgt = tgt.startsWith("/") ? tgt.slice(1) : "xl/" + tgt;
    const rows = [];
    for (const row of P(await z.get(tgt)).getElementsByTagName("row")) {
      const arr = [];
      for (const c of row.getElementsByTagName("c")) {
        const ref = c.getAttribute("r") || "", m = ref.match(/^([A-Z]+)/); let ci = 0; if (m) for (const ch of m[1]) ci = ci * 26 + ch.charCodeAt(0) - 64; ci--;
        const ty = c.getAttribute("t"), v = c.getElementsByTagName("v")[0]; let val = "";
        if (ty === "inlineStr") val = [...c.getElementsByTagName("t")].map((x) => x.textContent).join("");
        else if (v) val = ty === "s" ? (sst[+v.textContent] || "") : v.textContent;
        arr[ci < 0 ? arr.length : ci] = String(val).trim();
      }
      rows.push(arr);
    }
    return rows;
  }
  function itemsFromRows(rows) {
    const norm = (s) => fold(s).replace(/[^a-z0-9]/g, "");
    let hi = rows.findIndex((r) => r.some((c) => norm(c).includes("tenncc") || norm(c) === "nhacungcap" || norm(c) === "ten"));
    const idx = { name: 0, acc: 1, holder: 2, bank: 3 };
    if (hi >= 0) rows[hi].forEach((c, i) => { const n = norm(c); if (n.includes("tenncc") || n === "nhacungcap" || n === "ten") idx.name = i; else if (n.includes("sotaikhoan") || n === "stk") idx.acc = i; else if (n.includes("nguoithuhuong") || n.includes("tenthuhuong")) idx.holder = i; else if (n.includes("nganhang")) idx.bank = i; });
    const items = [];
    for (const r of rows.slice(hi + 1)) { const name = (r[idx.name] || "").trim(); if (!name) continue; items.push({ name, acc: (r[idx.acc] || "").trim(), holder: (r[idx.holder] || "").trim(), bank: (r[idx.bank] || "").trim() }); }
    return items;
  }
  function download(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); }

  /* ---------- điền vào form Odoo ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function setNative(el, v) {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  async function fillText(sel, value, over) {
    const el = $(sel);
    if (!el) return "không thấy ô";
    if (!value) return "DB trống";
    if (el.value && el.value.trim() && !over && fold(el.value) !== fold(value)) return "đã có dữ liệu, giữ nguyên";
    el.focus(); setNative(el, value); el.blur();
    return "ok";
  }
  const BANK_ALIAS = { vcb: ["vietcombank", "ngoai thuong", "vcb"], vietcombank: ["vietcombank", "ngoai thuong"], ctg: ["vietinbank", "cong thuong"], vietinbank: ["vietinbank", "cong thuong"], bidv: ["bidv", "dau tu"], tcb: ["techcombank", "ky thuong"], techcombank: ["techcombank", "ky thuong"], mb: ["mbbank", "quan doi"], mbbank: ["mbbank", "quan doi"], acb: ["acb", "a chau"], vpbank: ["vpbank", "thinh vuong"], tpbank: ["tpbank", "tien phong"], agribank: ["agribank", "nong nghiep"], sacombank: ["sacombank", "sai gon thuong tin"], hdbank: ["hdbank", "phat trien thanh pho"], ocb: ["ocb", "phuong dong"], msb: ["msb", "hang hai"], vib: ["vib", "quoc te"], shb: ["shb", "sai gon ha noi"], eximbank: ["eximbank", "xuat nhap khau"], seabank: ["seabank", "dong nam a"], scb: ["scb"] };
  const BW_STOP = new Set(["ngan", "hang", "tmcp", "viet", "nam", "cp", "nh"]);
  const plainWords = (s) => fold(s).replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  function bankWords(s) { const out = new Set(core(s)); for (const x of plainWords(s)) if (BANK_ALIAS[x]) for (const q of BANK_ALIAS[x]) q.split(" ").forEach((w) => out.add(w)); return out; }
  function bankQueries(bank) {
    const q = [bank], ws = plainWords(bank);
    for (const x of ws) if (BANK_ALIAS[x]) q.push(...BANK_ALIAS[x]);
    q.push(...ws.filter((x) => x.length > 2 && !BW_STOP.has(x) && !BANK_ALIAS[x]).slice(0, 3));
    return [...new Set(q)];
  }
  function dropdownItems() { return [...document.querySelectorAll(".o-autocomplete--dropdown-item, ul.ui-autocomplete li, .o-autocomplete--dropdown-menu li")].filter((e) => (e.offsetParent !== null || e.getClientRects().length) && !/không có|no records|tạo|create|tìm kiếm thêm|search more|tạo và chỉnh sửa/i.test(e.textContent)); }
  async function fillBank(sel, bank, over) {
    const el = $(sel);
    if (!el) return "không thấy ô";
    if (!bank) return "DB trống";
    if (el.value && el.value.trim() && !over) return "đã có dữ liệu, giữ nguyên";
    const want = bankWords(bank);
    const queries = bankQueries(bank);
    for (const q of queries) {
      el.focus(); setNative(el, q);
      let items = [];
      for (let i = 0; i < 8 && !items.length; i++) { await sleep(150); items = dropdownItems(); }
      if (!items.length) continue;
      let best = null, bs = -1;
      for (const it of items) { const sc = inter(bankWords(it.textContent), want); if (sc > bs) { bs = sc; best = it; } }
      if (bs > 0 || items.length === 1) { (best.querySelector("a") || best).click(); await sleep(150); return "ok (" + best.textContent.trim().slice(0, 40) + ")"; }
    }
    return "không chọn được ngân hàng – hãy chọn tay (đã gõ: " + bank + ")";
  }
  function partnerName() {
    const i = $(SEL.partner); if (i && i.value) return i.value.trim();
    const d = $('[name="partner_id"]'); return d ? d.textContent.trim() : "";
  }


  /* ---------- tin nhắn nhắc kế toán trong Chatter: mẫu có sẵn + @tag người nhận ---------- */
  // Sửa tên/mã/nội dung ở đây khi đổi người nhận. Dung Quất kiểm tra trước vì tên công ty Dung Quất cũng chứa "Phúc Hà".
  const TPL = [
    { key: "pay_dq", label: "Duyệt PAY – Dung Quất (Nguyễn Thị Mai)", code: "HN0096", name: "Nguyễn Thị Mai", text: "Chị ơi, kiểm tra giúp em phiếu này ạ" },
    { key: "pay_ph", label: "Duyệt PAY – Phúc Hà (Lê Xuân Giang)", code: "HN0025", name: "Lê Xuân Giang", text: "Anh ơi, kiểm tra giúp em phiếu này ạ" },
    { key: "ktnh", label: "KTNH xác nhận – thanh toán (Phạm Thị Mai Lê)", code: "HN10265", name: "Phạm Thị Mai Lê", text: "Em ơi, kiểm tra giúp anh phiếu này" },
    { key: "inv_dq", label: "Xác nhận hóa đơn PO – Dung Quất (Nguyễn Thị Mai)", code: "HN0096", name: "Nguyễn Thị Mai", text: "Chị ơi, xác nhận hóa đơn này giúp em" },
    { key: "inv_ph", label: "Xác nhận hóa đơn PO – Phúc Hà (Tống Sỹ Xuân Trường)", code: "HN0176", name: "Tống Sỹ Xuân Trường", text: "Anh ơi, xác nhận hóa đơn này giúp em" },
  ];
  const tplByKey = (k) => TPL.find((t) => t.key === k);
  const isDQ = (co) => /dung qu[aấ]t/i.test(co);
  const COMPOSER = "textarea.o-mail-Composer-input, .o-mail-Composer-input";
  const LOG_KEY = "remind_log_v1";
  function companyName() {
    const i = $('[name="company_id"] input, input[id^="company_id"]'); if (i && i.value) return i.value.trim();
    const d = $('[name="company_id"]'); if (d && d.textContent.trim()) return d.textContent.trim();
    const sw = $(".o_switch_company_menu .oe_topbar_name, .o_switch_company_menu"); return sw ? sw.textContent.trim() : "";
  }
  async function waitFor(fn, ms = 4000) { const t = Date.now(); for (;;) { const v = fn(); if (v) return v; if (Date.now() - t > ms) return null; await sleep(120); } }
  function setComposer(el, v) {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) setNative(el, v);
    else { el.textContent = v; el.dispatchEvent(new Event("input", { bubbles: true })); }
  }
  const composerText = (el) => ("value" in el ? el.value : el.textContent) || "";
  function docInfo() { // số chứng từ đang mở: PAY…, …/BNK…, hoặc mã PO
    const no = $('[name="name"] input, [name="name"], input[id^="name"]');
    let id = no ? String(no.value || no.textContent || "").trim() : "";
    if (!id) { const bc = $(".o_breadcrumb .active, .o_last_breadcrumb_item"); if (bc) id = bc.textContent.trim(); } // dự phòng khi Odoo đổi cấu trúc ô số chứng từ
    const m = location.pathname.match(/account\.payment\/(\d+)/) || location.pathname.match(/\/(?:vendor-payments|purchase|action-\d+)\/(\d+)/), rid = m ? m[1] : ""; // ID bản ghi trong địa chỉ trang: dashboard dùng để khớp khi không đọc được số chứng từ
    return { id, rid, kind: isPayPage() ? (/BNK/i.test(id) ? "BNK" : "PAY") : "PO" };
  }
  const pad = (n) => String(n).padStart(2, "0");
  const nowIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  /* Ghi nhật ký khi tin đã gửi THÀNH CÔNG (thấy tin xuất hiện trong luồng trao đổi): số PAY/BNK/PO, mẫu, nội dung, thời gian.
     Dashboard (cùng trình duyệt) đọc nhật ký này để tự điền cột Ghi chú của tab Phiếu thanh toán. */
  function logSent(tpl, doc) {
    const log = st.get(LOG_KEY, []);
    log.push({ id: doc.id, rid: doc.rid, kind: doc.kind, tpl: tpl.key, label: tpl.label, to: tpl.name, text: tpl.text, date: nowIso() });
    st.set(LOG_KEY, log.slice(-500));
    msg(`✔ Đã gửi tin cho ${tpl.name} – đã ghi nhật ký (${doc.kind} ${doc.id}). Dashboard sẽ tự điền vào cột Ghi chú.`);
    if (ui) ui.box.querySelector(".lg").textContent = `${st.get(LOG_KEY, []).length} tin đã ghi nhật ký`;
  }
  const norm = (x) => String(x || "").replace(/[\s\u00a0]+/g, " ").trim().toLowerCase();
  let watcher = 0, sendAt = 0, active = null;
  function watchSent(tpl, doc, box) {
    const key = norm(tpl.text);
    const marks = () => [...document.querySelectorAll(".o-mail-Message")].filter((m) => norm(m.textContent).includes(key)).length;
    const base = marks(), t0 = Date.now(), my = ++watcher;
    active = tpl.key;
    (async () => {
      while (my === watcher && Date.now() - t0 < 10 * 60 * 1000) {
        await sleep(700);
        if (!PATH_RE.test(location.pathname)) break;
        // Odoo 17+ đóng ô soạn tin sau khi gửi: ô cũ bị gỡ khỏi trang nhưng vẫn giữ chữ đã gõ, nên phải coi là "không còn đang gõ"
        const cur = box.isConnected ? box : $(COMPOSER);
        const typed = cur ? norm(composerText(cur)).includes(key) : false;
        if (marks() > base && !typed) { active = null; return logSent(tpl, doc); }
        // dự phòng: đã bấm Gửi, ô soạn tin đã trống nhưng chưa nhận ra tin trong luồng (Odoo đổi giao diện) sau 4 giây
        if (sendAt >= t0 && !typed && Date.now() - sendAt > 4000) { active = null; return logSent(tpl, doc); }
      }
      if (my === watcher) active = null;
    })();
  }
  /* Bắt cả tin gõ/dán tay: bấm Gửi (hoặc Enter) khi ô soạn tin chứa đúng nội dung một mẫu thì cũng ghi nhật ký */
  function hookSend() {
    const onSend = () => {
      const box = $(COMPOSER); if (!box) return;
      const txt = norm(composerText(box)), tpl = TPL.find((t) => txt.includes(norm(t.text)));
      if (!tpl) return;
      if (active !== tpl.key) watchSent(tpl, docInfo(), box);
      sendAt = Date.now();
    };
    document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest(".o-mail-Composer-send")) onSend(); }, true);
    document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.closest && e.target.closest(".o-mail-Composer")) onSend(); }, true);
  }
  /* ---------- Phiếu kho (stock.picking): nhắn Zalo cho Thủ kho (bán tự động) ----------
     Lấy số phiếu kho (vd. KDQ/IN/00398) trên màn hình, ghép vào mẫu tin, sao chép vào bộ nhớ tạm và mở cuộc trò chuyện Zalo của Thủ kho
     tương ứng (theo đầu số phiếu: KDQ, KPH…). Người dùng dán (Ctrl+V) và bấm Gửi. Danh sách Thủ kho và mẫu tin lưu trong trình duyệt này. */
  const ZALO_KEY = "zalo_keepers_v1";
  const ZALO_DEFAULT_TPL = "Chị ơi, kiểm đếm và nhập giúp em phiếu kho này {phieu}";
  const loadZalo = () => { const z = st.get(ZALO_KEY, null); return z && Array.isArray(z.keepers) ? { tpl: z.tpl || ZALO_DEFAULT_TPL, keepers: z.keepers, app: !!z.app } : { tpl: ZALO_DEFAULT_TPL, keepers: [], app: false }; };
  function pickingName() { // số phiếu kho đang mở (chỉ khi là phiếu kho: có tên dạng KDQ/IN/00398 và các trường loại điều chuyển, kho đích)
    const n = $('[name="name"]'); const t = n ? n.textContent.trim() : "";
    if (!/^[A-Za-z0-9]{2,8}\/[A-Za-z0-9]{1,8}\/\d{3,}$/.test(t)) return "";
    return $('[name="picking_type_id"]') && $('[name="location_dest_id"]') ? t : "";
  }
  const isPicking = () => !isPayRecord() && !!pickingName();
  function zaloUrl(v) { // số điện thoại Zalo -> liên kết trò chuyện; đã là liên kết (nhóm, hồ sơ) thì giữ nguyên
    const s = String(v || "").trim(); if (!s) return "";
    if (/^https:\/\/(zalo\.me|chat\.zalo\.me)\//i.test(s)) return s;
    const d = s.replace(/[^\d]/g, ""); return d.length >= 9 ? "https://zalo.me/" + d : "";
  }
  function keeperFor(name) { // chọn Thủ kho theo đầu số phiếu (KDQ…), không có thì lấy dòng mặc định (đầu số trống hoặc *)
    const z = loadZalo(), pre = name.split("/")[0].toUpperCase();
    const ok = (k) => zaloUrl(k.zalo) || String(k.name || "").trim(); // có số/liên kết, hoặc chỉ có tên (dùng chat cũ trên Zalo Web)
    return z.keepers.find((k) => String(k.prefix || "").trim().toUpperCase() === pre && ok(k)) || z.keepers.find((k) => ["", "*"].includes(String(k.prefix || "").trim()) && ok(k)) || null;
  }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
    try { const ta = document.createElement("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; } catch (e) { return false; }
  }
  /* Gửi tin sang tab Zalo Web (script Tampermonkey trên chat.zalo.me nhận và điền vào ô chat, KHÔNG tự gửi).
     Hai chiều để chắc chắn tới nơi: đẩy tin sang tab Zalo vài lần trong 30 giây đầu, và trả lời khi tab Zalo chủ động xin (window.opener). */
  let zaloMsg = null;
  const ZALO_ORIGINS = ["https://chat.zalo.me", "https://zalo.me"];
  if (location.hostname === "erp.dekko.com.vn") addEventListener("message", (e) => {
    if (!ZALO_ORIGINS.includes(e.origin)) return;
    const d = e.data;
    if (d && d.qlcvz === "req" && zaloMsg && Date.now() - zaloMsg.at < 10 * 60 * 1000) e.source.postMessage({ qlcvz: "fill", id: zaloMsg.at, text: zaloMsg.text, to: zaloMsg.to, manual: zaloMsg.manual, phone: zaloMsg.phone, app: zaloMsg.app }, e.origin);
  });
  function pushZalo(w, m) {
    [1500, 4000, 8000, 15000, 30000].forEach((ms) => setTimeout(() => {
      try { if (w && !w.closed) ZALO_ORIGINS.forEach((o) => w.postMessage({ qlcvz: "fill", id: m.at, text: m.text, to: m.to, manual: m.manual, phone: m.phone, app: m.app }, o)); } catch (e) {}
    }, ms));
  }
  let zaloBusy = 0;
  async function runZalo() {
    const name = pickingName(); if (!name) return msg("Không nhận ra số phiếu kho trên màn hình này.", true);
    if (Date.now() - zaloBusy < 4000) return; // chống bấm dồn
    zaloBusy = Date.now();
    const k = keeperFor(name);
    if (!k) { msg("Chưa có Zalo của Thủ kho cho phiếu " + name + ". Hãy nhập ở hộp vừa mở.", true); return zaloSettings(name.split("/")[0]); }
    const text = loadZalo().tpl.split("{phieu}").join(name);
    const ok = await copyText(text);
    const url = zaloUrl(k.zalo), isLink = /^https:\/\//i.test(String(k.zalo || "").trim());
    const phone = isLink ? "" : String(k.zalo || "").replace(/[^\d]/g, "");
    // Số điện thoại: zalo.me/<số> chuyển sang ỨNG DỤNG Zalo trên máy, nên mở thẳng Zalo Web và để bạn chọn cuộc trò chuyện; liên kết (nhóm/hồ sơ) thì mở đúng liên kết
    if (loadZalo().app && !url) { // dùng ứng dụng nhưng chỉ có tên (tài khoản không cho tìm bằng số / không có liên kết): chỉ sao chép tin, bạn chọn chat cũ trong ứng dụng
      return msg((ok ? "Đã sao chép tin: " : "Không sao chép được, hãy gõ tay: ") + "“" + text + "”\nMở ứng dụng Zalo, bấm vào chat cũ với " + (k.name || "Thủ kho") + ", bấm ô chat, Ctrl+V, kiểm tra rồi Enter.", !ok);
    }
    const useApp = loadZalo().app && !!url; // ứng dụng Zalo: mở trang zalo.me/<số> (hoặc liên kết) rồi script tự bấm “Nhắn tin”
    zaloMsg = { at: Date.now(), text, to: k.name || "", manual: !isLink && !useApp, phone, app: useApp };
    const w = window.open(useApp || isLink ? url : "https://chat.zalo.me/", "zalo-chat");
    pushZalo(w, zaloMsg);
    msg((ok ? "Đã sao chép tin: " : "Không sao chép được, hãy gõ tay: ") + "“" + text + "”\n" + (useApp
      ? "Đang mở ứng dụng Zalo của " + (k.name || "Thủ kho") + " (nếu trình duyệt hỏi, chọn Mở; nếu chưa mở thì bấm nút “Nhắn tin” trên trang vừa hiện). Trong ứng dụng: bấm ô chat, Ctrl+V, kiểm tra rồi Enter."
      : isLink
      ? "Đã mở Zalo của " + (k.name || "Thủ kho") + ". Nếu đã cài script Zalo, tin tự điền vào ô chat (bạn kiểm tra rồi bấm Enter); nếu không thì dán (Ctrl+V)."
      : "Đã mở Zalo Web. Hãy mở cuộc trò chuyện với " + (k.name || "Thủ kho") + (phone ? " (tìm SĐT " + phone + " ở ô Tìm kiếm)" : " (chat cũ)") + ", rồi bấm nút “Điền vào cuộc trò chuyện đang mở” ở khung nhỏ góc trái dưới trang Zalo (hoặc dán Ctrl+V)."), !ok);
  }
  function zaloSettings(focusPrefix) {
    if (document.getElementById("nccz-modal")) return;
    const z = loadZalo(), rows = z.keepers.length ? z.keepers.map((k) => ({ ...k })) : [{ prefix: focusPrefix || "", name: "", zalo: "" }];
    if (focusPrefix && !rows.some((r) => String(r.prefix || "").trim().toUpperCase() === focusPrefix.toUpperCase())) rows.push({ prefix: focusPrefix, name: "", zalo: "" }); // thêm sẵn dòng cho đầu số của phiếu đang mở
    const m = document.createElement("div"); m.id = "nccz-modal";
    m.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font:13px/1.4 system-ui,Segoe UI,sans-serif";
    const rowHtml = (r, i) => '<div class="zr" data-i="' + i + '" style="display:grid;grid-template-columns:70px 1fr 1.4fr 28px;gap:6px;margin-bottom:6px"><input class="p" placeholder="Đầu số (KDQ)" value="' + xe(r.prefix || "") + '"><input class="n" placeholder="Tên Thủ kho" value="' + xe(r.name || "") + '"><input class="z" placeholder="SĐT / liên kết zalo.me (trống = dùng chat cũ)" value="' + xe(r.zalo || "") + '"><button class="x" title="Xóa dòng" style="border:1px solid #bbb;border-radius:6px;background:#fff;cursor:pointer">✕</button></div>';
    m.innerHTML = '<div style="background:#fff;color:#222;border-radius:12px;padding:18px 20px;width:min(560px,94vw);box-shadow:0 10px 40px rgba(0,0,0,.35)"><div style="font-size:15px;font-weight:700;margin-bottom:8px">💬 Zalo Thủ kho (phiếu kho)</div>' +
      '<div style="margin-bottom:6px;color:#555">Mỗi dòng: đầu số phiếu kho (KDQ, KPH… để trống hoặc * = dùng cho mọi phiếu), tên, và số điện thoại đã đăng ký Zalo hoặc liên kết zalo.me (nhóm). Không có số: chỉ ghi tên và để trống ô số, dùng chat cũ trên Zalo Web. Dữ liệu chỉ lưu trong trình duyệt này.</div>' +
      '<div class="rows"></div><button class="add" style="padding:5px 10px;border:1px solid #888;border-radius:6px;background:#f5f5f5;cursor:pointer;margin-bottom:10px">＋ Thêm Thủ kho</button>' +
      '<div style="margin-bottom:4px;font-weight:600">Mẫu tin nhắn <small style="font-weight:400;color:#666">({phieu} = số phiếu kho)</small></div><textarea class="tpl" rows="2" style="width:100%;padding:6px;border:1px solid #bbb;border-radius:6px;font:inherit"></textarea>' +
      '<label style="display:flex;gap:6px;align-items:flex-start;margin-top:10px"><input type="checkbox" class="zapp" style="margin-top:3px"><span><b>Dùng ứng dụng Zalo trên máy</b> (thay cho Zalo Web): mở trang <i>zalo.me</i> của Thủ kho và tự bấm “Nhắn tin” để ứng dụng mở đúng cuộc trò chuyện; tin đã được sao chép sẵn, bạn bấm vào ô chat, <b>Ctrl+V</b>, kiểm tra rồi Enter. Cần ghi <b>số điện thoại hoặc liên kết</b> của Thủ kho.</span></label>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px"><button class="cancel" style="padding:7px 14px;border:1px solid #888;border-radius:8px;background:#f5f5f5;cursor:pointer;font:inherit">Hủy</button><button class="save" style="padding:7px 16px;border:0;border-radius:8px;background:#1565c0;color:#fff;cursor:pointer;font:inherit;font-weight:700">Lưu</button></div></div>';
    document.body.appendChild(m);
    const host = m.querySelector(".rows"), draw = () => { host.innerHTML = rows.map(rowHtml).join(""); };
    const sync = () => host.querySelectorAll(".zr").forEach((el) => { const r = rows[+el.dataset.i]; if (r) { r.prefix = el.querySelector(".p").value; r.name = el.querySelector(".n").value; r.zalo = el.querySelector(".z").value; } });
    draw(); m.querySelector(".tpl").value = z.tpl; m.querySelector(".zapp").checked = !!z.app;
    host.onclick = (e) => { const b = e.target.closest(".x"); if (!b) return; sync(); rows.splice(+b.closest(".zr").dataset.i, 1); if (!rows.length) rows.push({ prefix: "", name: "", zalo: "" }); draw(); };
    m.querySelector(".add").onclick = () => { sync(); rows.push({ prefix: "", name: "", zalo: "" }); draw(); };
    m.querySelector(".cancel").onclick = () => m.remove();
    m.querySelector(".save").onclick = () => {
      sync();
      const keepers = rows.filter((r) => zaloUrl(r.zalo) || String(r.name || "").trim()).map((r) => ({ prefix: String(r.prefix || "").trim(), name: String(r.name || "").trim(), zalo: String(r.zalo || "").trim() }));
      const tpl = m.querySelector(".tpl").value.trim() || ZALO_DEFAULT_TPL;
      st.set(ZALO_KEY, { tpl, keepers, app: m.querySelector(".zapp").checked }); m.remove(); msg("Đã lưu " + keepers.length + " Thủ kho. Bấm “💬 Nhắn Zalo thủ kho” để gửi.");
    };
  }
  /* ---------- Sau khi bấm “Gửi” (gửi đề nghị thanh toán): hỏi có in “Đề nghị thanh toán” không ----------
     Áp dụng cho phiếu thanh toán ở mọi đường dẫn (công nợ: /odoo/vendor-bills/…/account.payment/…, trả trước: /odoo/action-…/<PO>/account.payment/…,
     chi khác: /odoo/vendor-payments/…). Nếu đồng ý: bấm ⚙ → “In Đề nghị thanh toán” (có chờ giữa các bước để không trượt/bấm dồn),
     đợi bản xem trước PDF nạp xong rồi bấm nút In của trình xem PDF. Hộp thoại in của trình duyệt để người dùng tự xác nhận, căn chỉnh. */
  const PRINT_ITEM = "In Đề nghị thanh toán", HOLD = 700;
  let printing = false, askTimer = 0;
  const isShown = (e) => !!e && (e.offsetParent !== null || e.getClientRects().length > 0);
  function sendBtn() { // nút “Gửi” trên thanh trạng thái của phiếu (không phải nút Gửi tin trong luồng trao đổi)
    return [...document.querySelectorAll(".o_form_statusbar button.btn-primary")].find((b) => b.textContent.trim() === "Gửi" && !b.closest(".o-mail-Chatter,.o-mail-Composer") && isShown(b)) || null;
  }
  const stateText = () => ((document.querySelector(".o_form_statusbar .o_arrow_button_current") || {}).textContent || "").trim();
  function hookSendRequest() {
    document.addEventListener("click", (e) => {
      if (!isPayRecord() || cfg().askPrint === false) return;
      const b = e.target.closest && e.target.closest(".o_form_statusbar button.btn-primary");
      if (!b || b.closest(".o-mail-Chatter,.o-mail-Composer") || b.textContent.trim() !== "Gửi") return;
      watchSendRequest(stateText(), docInfo().id);
    }, true);
  }
  function watchSendRequest(state0, id) { // chờ lệnh Gửi thành công (nút Gửi biến mất hoặc bước trạng thái đổi); lỗi/hủy thì không hỏi
    clearInterval(askTimer);
    const t0 = Date.now();
    askTimer = setInterval(() => {
      if (Date.now() - t0 > 40000) { clearInterval(askTimer); return; }
      if (document.querySelector(".o_error_dialog, .o_notification.border-danger")) { clearInterval(askTimer); return; } // lỗi khi gửi
      if (document.querySelector(".modal:not(#nccpr-modal)") && Date.now() - t0 < 38000) return; // đang có hộp xác nhận của Odoo: chờ người dùng
      if (Date.now() - t0 < 1200) return;
      if (!sendBtn() || (stateText() && stateText() !== state0)) { clearInterval(askTimer); askPrint(id); }
    }, 400);
  }
  function askPrint(id) {
    if (document.getElementById("nccpr-modal") || printing) return;
    const box = document.createElement("div");
    box.id = "nccpr-modal";
    box.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font:14px/1.45 system-ui,Segoe UI,sans-serif";
    box.innerHTML = '<div style="background:#fff;color:#222;border-radius:12px;padding:20px 22px;width:min(440px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.35)">' +
      '<div style="font-size:16px;font-weight:700;margin-bottom:6px">✅ Đã gửi đề nghị thanh toán' + (id ? " " + xe(id) : "") + '</div>' +
      '<div style="margin-bottom:12px">Bạn có muốn <b>in Đề nghị thanh toán</b> ngay không?<br><small style="color:#666">Sẽ bấm ⚙ → “' + PRINT_ITEM + '”, chờ bản xem trước nạp xong rồi mở hộp thoại in. Bạn tự xác nhận và căn chỉnh trong hộp thoại in.</small></div>' +
      '<div class="pst" style="min-height:18px;font-size:12px;margin-bottom:8px"></div>' +
      '<div style="display:flex;gap:8px;justify-content:flex-end"><button class="no" style="padding:8px 14px;border:1px solid #888;border-radius:8px;background:#f5f5f5;cursor:pointer;font:inherit">Không in</button>' +
      '<button class="yes" style="padding:8px 16px;border:0;border-radius:8px;background:#1565c0;color:#fff;cursor:pointer;font:inherit;font-weight:700">🖨 In đề nghị</button></div></div>';
    document.body.appendChild(box);
    const st = box.querySelector(".pst"), yes = box.querySelector(".yes"), no = box.querySelector(".no");
    const say = (t, bad) => { st.textContent = t; st.style.color = bad ? "#c62828" : "#2e7d32"; };
    const close = () => box.remove();
    no.onclick = close;
    box.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    yes.onclick = async () => {
      if (printing) return; // chống bấm dồn
      printing = true; yes.disabled = no.disabled = true; yes.style.opacity = no.style.opacity = ".6";
      try { await runPrintFlow(say); box.remove(); }
      catch (err) { say("Chưa in tự động được: " + err.message + " Hãy bấm tay ⚙ → “" + PRINT_ITEM + "”.", true); no.disabled = false; no.textContent = "Đóng"; }
      finally { setTimeout(() => { printing = false; }, 4000); } // khoảng nghỉ sau mỗi lần in để tránh bấm lặp
    };
    yes.focus();
  }
  async function runPrintFlow(say) {
    say("Chuẩn bị mở menu ⚙…"); await sleep(HOLD);
    const cog = document.querySelector(".o_control_panel .fa-cog");
    const tog = cog && (cog.closest("button") || cog.parentElement);
    if (!tog) throw new Error("không thấy biểu tượng ⚙.");
    if (!tog.classList.contains("show")) tog.click();
    const item = await waitFor(() => [...document.querySelectorAll(".o-dropdown--menu .dropdown-item, .dropdown-menu .dropdown-item")].find((e) => isShown(e) && e.textContent.trim() === PRINT_ITEM), 5000);
    if (!item) throw new Error("không thấy mục “" + PRINT_ITEM + "” trong menu ⚙.");
    say("Đã mở menu, giữ một chút rồi bấm “" + PRINT_ITEM + "”…"); await sleep(HOLD + 300);
    if (!item.isConnected || item.textContent.trim() !== PRINT_ITEM) throw new Error("menu thay đổi, không bấm để tránh nhầm mục.");
    item.click();
    say("Đang tạo bản xem trước…");
    const frame = await waitFor(() => document.querySelector(".dynamic-word-report-preview-iframe"), 15000);
    if (!frame) throw new Error("không thấy bản xem trước Đề nghị thanh toán.");
    const ready = await waitFor(() => { try { const a = frame.contentWindow.PDFViewerApplication; return a && a.pdfDocument && a.pagesCount > 0 && frame.contentDocument.querySelector("#printButton"); } catch (e) { return null; } }, 20000);
    if (!ready) throw new Error("bản xem trước chưa nạp xong.");
    say("Bản xem trước đã sẵn sàng, giữ một chút rồi bấm In…"); await sleep(HOLD + 300);
    const pb = frame.contentDocument.querySelector("#printButton");
    if (!pb || pb.disabled) throw new Error("nút In của trình xem PDF chưa dùng được.");
    pb.click();
    msg("Đã mở hộp thoại in Đề nghị thanh toán: hãy kiểm tra, căn chỉnh rồi xác nhận in.");
  }
  if (location.hostname === "erp.dekko.com.vn") { hookSend(); hookSendRequest(); }
  async function typeMessage(tpl) {
    const doc = docInfo();
    let box = $(COMPOSER);
    if (!box) { const b = $(".o-mail-Chatter-sendMessage"); if (b) b.click(); box = await waitFor(() => $(COMPOSER)); }
    if (!box) return msg("Không thấy ô Gửi tin. Hãy lưu phiếu rồi mở lại (phiếu mới chưa có Chatter).", true);
    if (composerText(box).includes(tpl.text)) return msg("Ô Gửi tin đã có nội dung nhắc, không gõ lại.", true);
    box.focus();
    setComposer(box, (composerText(box).trim() ? composerText(box).trim() + " " : "") + "@" + tpl.code);
    const item = await waitFor(() => [...document.querySelectorAll(".o-mail-NavigableList-item, .o-mail-Composer-suggestion")].find((e) => (e.offsetParent !== null || e.getClientRects().length) && e.textContent.includes(tpl.code)));
    if (!item) return msg("Không thấy gợi ý @" + tpl.code + " (" + tpl.name + "). Đã gõ @" + tpl.code + " – hãy chọn người trong danh sách rồi bấm lại, hoặc sửa mã trong TPL.", true);
    item.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); item.click();
    await sleep(250);
    setComposer(box, composerText(box).replace(/\s+$/, "") + " " + tpl.text);
    box.focus();
    watchSent(tpl, doc, box);
    if (cfg().autosend) {
      const send = await waitFor(() => { const b = $(".o-mail-Composer-send"); return b && !b.disabled ? b : null; }, 1500);
      if (send) { send.click(); return msg(`Đã bấm gửi tin cho ${tpl.name} (${tpl.code}), đang chờ xác nhận tin đã lên…`); }
      return msg("Đã gõ tin nhưng nút Gửi chưa bấm được – bấm Gửi bằng tay.", true);
    }
    msg(`Đã gõ sẵn tin tag ${tpl.name} (${tpl.code}). Kiểm tra rồi bấm Gửi; gửi xong script tự ghi nhật ký.`);
  }
  /* Nút theo kịch bản: tự chọn mẫu theo công ty / bước đang sáng trên thanh trạng thái */
  async function runRemind(mode) {
    const inv = mode === "invoice";
    const stEl = $(".o_statusbar_status .o_arrow_button_current, .o_statusbar_status button.active, .o_statusbar_status .o_arrow_button.disabled"), stText = stEl ? stEl.textContent.trim() : "";
    const ktnh = !inv && /ktnh/i.test(stText); // trạng thái “KTNH xác nhận” -> nhờ kế toán ngân hàng thanh toán
    const co = companyName();
    if (!ktnh && !/ph[uú]c h[aà]/i.test(co) && !isDQ(co)) return msg("Không nhận ra công ty “" + co + "” (cần chứa Phúc Hà hoặc Dung Quất). Hãy chọn mẫu bằng ô chọn bên dưới.", true);
    const tpl = tplByKey(inv ? (isDQ(co) ? "inv_dq" : "inv_ph") : ktnh ? "ktnh" : (isDQ(co) ? "pay_dq" : "pay_ph"));
    // Chỉ dành cho phiếu “⚠ Kiểm tra” trên dashboard: số chứng từ đã là BNK nhưng trạng thái còn Nháp
    if (!inv && !ktnh && !/BNK/i.test(docInfo().id) && !confirm("Phiếu này chưa có số BNK (không phải trường hợp “Kiểm tra” trên dashboard). Vẫn nhắc duyệt?")) return msg("Đã hủy.", true);
    return typeMessage(tpl);
  }
  /* Nút chọn tay: mẫu trong ô chọn (dùng cho mọi trường hợp ngoài kịch bản tự động) */
  async function runTemplate() {
    const tpl = tplByKey(ui.box.querySelector(".tpl").value);
    if (!tpl) return msg("Hãy chọn một mẫu tin nhắn trong danh sách.", true);
    return typeMessage(tpl);
  }
  function exportLog() {
    const log = st.get(LOG_KEY, []); if (!log.length) return msg("Nhật ký đang trống.", true);
    download(new Blob([JSON.stringify(log, null, 1)], { type: "application/json" }), "nhat-ky-nhan-tin.json"); msg("Đã xuất " + log.length + " dòng. Trong dashboard dùng “Nhập nhật ký nhắn” nếu nó chưa tự cập nhật.");
  }
  /* Chạy trên trang dashboard: chuyển nhật ký sang localStorage của dashboard để nó tự điền cột Ghi chú */
  function bridge() { try { localStorage.setItem("qlcv:remindlog", JSON.stringify(st.get(LOG_KEY, []))); } catch (e) {} }
  /* Xin dữ liệu tab "Thông tin thanh toán" từ tab dashboard đã mở trang Odoo này (window.opener), lưu lại để lần sau mở Odoo trực tiếp vẫn dùng được bản gần nhất */
  if (location.hostname === "erp.dekko.com.vn") addEventListener("message", (e) => {
    const d = e.data;
    if (!d || d.qlcv !== "bank-data" || !Array.isArray(d.items) || !/^https:\/\/[a-z0-9-]+\.github\.io$/i.test(e.origin)) return; // chỉ nhận từ trang dashboard (GitHub Pages), không phụ thuộc window.opener
    const items = d.items.filter((x) => x && x.name).map((x) => ({ name: String(x.name).trim(), acc: String(x.acc || "").trim(), holder: String(x.holder || "").trim(), bank: String(x.bank || "").trim(), checked: !!x.checked }));
    if (!items.length) return; // dashboard chưa có tab Thông tin thanh toán: không xóa bản đã nhận trước đó
    st.set(BANK_KEY, { updated: new Date().toISOString(), items });
    if (ui) refreshCount();
  });
  let lastReq = 0;
  function requestBank() {
    try { if (!window.opener || window.opener.closed || Date.now() - lastReq < 60000) return; lastReq = Date.now(); window.opener.postMessage({ qlcv: "bank-req" }, "*"); } catch (e) {}
  }
  /* Bản chạy bằng nút bookmark: gửi nhật ký sang tab dashboard đã mở trang Odoo này (window.opener) mỗi khi nhật ký đổi */
  let lastSent = "";
  function sendToOpener() {
    try {
      const log = st.get(LOG_KEY, []), j = JSON.stringify(log);
      if (j === lastSent || !window.opener || window.opener.closed) return;
      window.opener.postMessage({ qlcv: "remindlog", log }, "*"); lastSent = j;
    } catch (e) {}
  }
  function hintNote() {
    const d = document.createElement("div");
    d.style.cssText = "position:fixed;right:14px;bottom:14px;z-index:99999;background:#fff3cd;color:#664d03;border:1px solid #ffda6a;border-radius:8px;padding:10px 12px;font:13px system-ui;max-width:300px;box-shadow:0 4px 14px rgba(0,0,0,.2)";
    d.textContent = "Odoo Helper đã sẵn sàng. Hãy mở một phiếu thanh toán NCC hoặc một đơn mua (PO) để hiện khung nút.";
    document.body.appendChild(d); setTimeout(() => d.remove(), 6000);
  }

  /* ---------- giao diện ---------- */
  let ui = null, picked = null;
  function msg(t, bad) { if (ui) { ui.status.textContent = t; ui.status.style.color = bad ? "#c62828" : "#2e7d32"; } }
  async function runFill(manualItem) {
    const db = loadDb(), bank = loadBank().items.filter((x) => x.acc);
    if (!db.items.length && !bank.length) return msg("Chưa có dữ liệu NCC – bấm “Nạp Excel” hoặc mở Odoo từ dashboard (tab Thông tin thanh toán).", true);
    let item = manualItem || null, how = "chọn tay";
    if (!item) {
      const name = partnerName();
      if (!name) return msg("Chưa chọn Nhà cung cấp/Đối tác trong phiếu. Hãy chọn NCC rồi bấm lại (hoặc chọn tay bên dưới).", true);
      const distinct = (a) => new Set(a.map((h) => h.acc)).size;
      const fb = findSupplier(name, bank), ff = findSupplier(name, db.items), how2 = (f) => (f.how === "exact" ? "khớp tên" : "khớp gần đúng");
      const tabOk = fb.hits.filter((h) => h.checked), tabHits = tabOk.length ? tabOk : fb.hits; // trong tab, dòng đã tick "Đã kiểm tra" được ưu tiên
      const useFile = !!cfg().fromFile; // ô tick "Lấy dữ liệu từ file Excel đã nạp": mặc định KHÔNG tick = ưu tiên tab Thông tin thanh toán
      const order = useFile ? [["file", ff.hits, ff], ["tab", tabHits, fb]] : [["tab", tabHits, fb], ["file", ff.hits, ff]];
      for (const [kind, hits, f] of order) {
        if (!hits.length) continue;
        if (distinct(hits) > 1) { fillPicker(hits); return msg("“" + name + "” khớp nhiều dòng khác tài khoản trong " + (kind === "tab" ? "tab Thông tin thanh toán" : "file Excel đã nạp") + " – hãy chọn đúng trong danh sách.", true); }
        item = hits[0];
        how = kind === "tab" ? "tab Thông tin thanh toán (" + (item.checked ? "đã kiểm tra" : "CHƯA kiểm tra") + "), " + how2(f) : "file Excel đã nạp" + (useFile ? "" : ", tab Thông tin thanh toán không có NCC này") + ", " + how2(f);
        break;
      }
      if (!item) { fillPicker([...bank, ...db.items]); return msg("Không tìm thấy “" + name + "” trong tab Thông tin thanh toán và file Excel đã nạp. Chọn tay NCC trong danh sách hoặc thêm vào tab/Excel.", true); }
    }
    const c = cfg();
    const r1 = await fillText(SEL.acc, item.acc, c.overwrite), r2 = await fillText(SEL.holder, item.holder, c.overwrite), r3 = await fillBank(SEL.bank, item.bank, c.overwrite);
    const bad = [r1, r2, r3].some((x) => !/^ok/.test(x));
    msg(`NCC: ${item.name} (${how})\nSTK: ${r1} · Người TH: ${r2} · Ngân hàng: ${r3}`, bad);
  }
  function fillPicker(items) {
    ui.pick.innerHTML = '<option value="">— chọn NCC —</option>' + items.map((it, i) => `<option value="${i}">${xe(it.name)}</option>`).join("");
    ui.pick._items = items; ui.pick.style.display = "block";
  }
  function refreshCount() {
    const n = loadDb().items.length, bk = loadBank(), b = bk.items.filter((x) => x.acc), k = b.filter((x) => x.checked).length;
    const when = bk.updated ? " – cập nhật " + new Date(bk.updated).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "";
    ui.count.textContent = (n ? `${n} NCC trong DB Excel` : "DB Excel trống") + (b.length ? ` · ${b.length} NCC từ tab Thông tin thanh toán (${k} đã kiểm tra)${when}` : " · chưa nhận dữ liệu tab Thông tin thanh toán (mở Odoo từ dashboard)");
  }
  function build() {
    if (ui || !document.body) return;
    const css = document.createElement("style");
    css.textContent = `#nccaf{position:fixed;right:14px;bottom:14px;z-index:99999;font:13px/1.4 system-ui,Segoe UI,sans-serif;color:#222;background:#fff;border:1px solid #bbb;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,.25);width:300px}
#nccaf *{box-sizing:border-box}#nccaf .h{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#1565c0;color:#fff;border-radius:10px 10px 0 0;cursor:pointer;font-weight:600}
#nccaf .b{padding:10px;display:flex;flex-direction:column;gap:7px}#nccaf button{padding:7px 8px;border:1px solid #888;border-radius:6px;background:#f5f5f5;cursor:pointer;font:inherit}
#nccaf button.p{background:#2e7d32;color:#fff;border-color:#2e7d32;font-weight:700;padding:10px;font-size:14px}#nccaf button:hover{filter:brightness(.95)}
#nccaf .r{display:flex;gap:6px}#nccaf .r button{flex:1}#nccaf label{display:flex;gap:6px;align-items:center;font-size:12px}#nccaf select{width:100%;padding:5px;display:none}
#nccaf .s{white-space:pre-wrap;font-size:12px;min-height:16px}#nccaf.min .b{display:none}#nccaf small{color:#666}`;
    document.head.appendChild(css);
    const box = document.createElement("div"); box.id = "nccaf";
    box.innerHTML = `<div class="h"><span>💳 Tự điền thụ hưởng</span><span class="cnt"></span></div><div class="b">
<button class="p" data-a="fill">✨ Tự điền cho phiếu này</button>
<div class="r zl" style="display:none"><button class="p" data-a="zalo" title="Sao chép tin nhắn kèm số phiếu kho và mở Zalo của Thủ kho (bạn dán và bấm Gửi)" style="padding:10px;font-size:14px">💬 Nhắn Zalo thủ kho</button><button data-a="zalocfg" title="Cài đặt Zalo Thủ kho và mẫu tin" style="flex:0 0 40px">⚙</button></div>
<button data-a="invoice" title="PO ở bước Chờ KT xác nhận công nợ: gõ sẵn tin @tag kế toán xác nhận hóa đơn (Dung Quất: Nguyễn Thị Mai, Phúc Hà: Tống Sỹ Xuân Trường)">💬 Nhắc KT xác nhận hóa đơn (PO)</button>
<select class="tpl" style="display:block"><option value="">— Chọn mẫu tin nhắn có sẵn —</option>${TPL.map((t) => `<option value="${t.key}">${xe(t.label)}</option>`).join("")}</select>
<button data-a="tpl-send" title="Gõ sẵn mẫu đã chọn (@tag + nội dung) vào ô Gửi tin">✉ Gõ mẫu đã chọn</button>
<button data-a="remind" title="Gõ sẵn tin @tag người duyệt (Phúc Hà: Lê Xuân Giang, Dung Quất: Nguyễn Thị Mai) vào ô Gửi tin">💬 Nhắc duyệt PAY (tag người duyệt)</button>
<select class="pick"></select>
<div class="r"><button data-a="tpl">⬇ File Excel mẫu</button><button data-a="up">⬆ Nạp Excel</button></div>
<div class="r"><button data-a="exp">⬇ Xuất DB ra Excel</button><button data-a="clr">🗑 Xóa DB</button></div>
<label><input type="checkbox" class="ff" title="Mặc định (không tick): lấy từ tab Thông tin thanh toán trước, không có mới dùng file Excel đã nạp"> Lấy dữ liệu từ file Excel đã nạp (không tick = ưu tiên tab Thông tin thanh toán)</label>
<label><input type="checkbox" class="ov"> Ghi đè cả ô đã có dữ liệu</label>
<label><input type="checkbox" class="au"> Tự điền ngay khi mở phiếu</label>
<label><input type="checkbox" class="as"> Nhắc duyệt: tự bấm Gửi (mặc định chỉ gõ sẵn)</label>
<label><input type="checkbox" class="ap"> Sau khi bấm Gửi đề nghị thanh toán: hỏi có in Đề nghị thanh toán</label>
<div class="r"><button data-a="log" title="Xuất nhật ký các tin đã gửi (số PAY/BNK/PO, nội dung, ngày)">⬇ Xuất nhật ký nhắn</button></div><small class="lg"></small>
<div class="s"></div><small>Nạp được file .xlsx (mẫu) hoặc .json (bản cũ). Nạp lại sẽ cập nhật theo tên NCC.</small>
<input type="file" accept=".xlsx,.json" style="display:none"></div>`;
    document.body.appendChild(box);
    ui = { box, status: box.querySelector(".s"), count: box.querySelector(".cnt"), pick: box.querySelector(".pick"), file: box.querySelector('input[type=file]') };
    const c = cfg(); box.querySelector(".ov").checked = c.overwrite; box.querySelector(".au").checked = c.auto;
    box.querySelector(".ff").checked = !!c.fromFile; box.querySelector(".ff").onchange = (e) => st.set(CFG_KEY, { ...cfg(), fromFile: e.target.checked });
    box.querySelector(".ov").onchange = (e) => st.set(CFG_KEY, { ...cfg(), overwrite: e.target.checked });
    box.querySelector(".au").onchange = (e) => st.set(CFG_KEY, { ...cfg(), auto: e.target.checked });
    box.querySelector(".ap").checked = c.askPrint !== false; box.querySelector(".ap").onchange = (e) => st.set(CFG_KEY, { ...cfg(), askPrint: e.target.checked });
    box.querySelector(".as").checked = !!c.autosend; box.querySelector(".as").onchange = (e) => st.set(CFG_KEY, { ...cfg(), autosend: e.target.checked });
    box.querySelector(".h").onclick = () => box.classList.toggle("min");
    ui.pick.onchange = () => { const it = ui.pick._items[+ui.pick.value]; if (it) runFill(it); };
    ui.file.onchange = async () => {
      const f = ui.file.files[0]; ui.file.value = ""; if (!f) return;
      try {
        let items;
        if (/\.json$/i.test(f.name)) { const j = JSON.parse(await f.text()); items = (j.items || j).map((x) => ({ name: String(x.name || "").trim(), acc: String(x.acc || "").trim(), holder: String(x.holder || "").trim(), bank: String(x.bank || "").trim() })).filter((x) => x.name); }
        else items = itemsFromRows(await readXlsx(await f.arrayBuffer()));
        if (!items.length) return msg("Không đọc được NCC nào (kiểm tra dòng tiêu đề: Tên NCC | Số tài khoản | Tên người thụ hưởng | Ngân hàng thụ hưởng).", true);
        const cur = loadDb().items, map = new Map(cur.map((x) => [fold(x.name).trim(), x])); let add = 0, upd = 0;
        for (const it of items) { const k = fold(it.name).trim(); if (map.has(k)) { Object.assign(map.get(k), it); upd++; } else { map.set(k, it); add++; } }
        saveDb([...map.values()]); refreshCount();
        const miss = items.filter((x) => !x.acc).length;
        msg(`Đã nạp ${items.length} dòng: thêm ${add}, cập nhật ${upd}.` + (miss ? `\nLưu ý: ${miss} NCC chưa có số tài khoản.` : ""));
      } catch (e) { msg("Lỗi đọc file: " + e.message, true); }
    };
    box.onclick = (e) => {
      const a = e.target.closest("button")?.dataset.a; if (!a) return;
      if (a === "fill") runFill();
      else if (a === "remind") runRemind();
      else if (a === "invoice") runRemind("invoice");
      else if (a === "zalo") runZalo();
      else if (a === "zalocfg") zaloSettings(pickingName().split("/")[0]);
      else if (a === "tpl-send") runTemplate();
      else if (a === "log") exportLog();
      else if (a === "up") ui.file.click();
      else if (a === "tpl") { download(makeXlsx(loadDb().items.length ? [] : [
        { name: "CÔNG TY TNHH THIẾT BỊ CÔNG NGHIỆP VÀ DỊCH VỤ KỸ THUẬT THÁI SƠN", acc: "111.002.712.129", holder: "Công Ty TNHH Thiết Bị Công nghiệp & Dịch vụ Kỹ thuật Thái Sơn", bank: "Vietinbank" },
        { name: "CHI NHÁNH CÔNG TY CỔ PHẦN ĐÁ MÀI HẢI DƯƠNG", acc: "0711000230939", holder: "CHI NHÁNH CÔNG TY CỔ PHẦN ĐÁ MÀI HẢI DƯƠNG", bank: "VCB – NGAN HANG TMCP NGOAI THUONG VIET NAM" }], "Điền từ dòng 2 trở đi, mỗi NCC một dòng. Cột Tên NCC nên giống tên trên Odoo (không cần có mã XHN-...). Xóa 2 dòng ví dụ nếu không dùng."), "NCC-thong-tin-thu-huong-MAU.xlsx"); msg("Đã tải file mẫu."); }
      else if (a === "exp") { const it = loadDb().items; if (!it.length) return msg("DB đang trống.", true); download(makeXlsx(it), "NCC-thong-tin-thu-huong.xlsx"); msg("Đã xuất " + it.length + " NCC."); }
      else if (a === "clr") { if (confirm("Xóa toàn bộ DB NCC trong Tampermonkey? (Nên xuất Excel trước)")) { saveDb([]); refreshCount(); msg("Đã xóa DB."); } }
    };
    refreshCount(); box.querySelector(".lg").textContent = `${st.get(LOG_KEY, []).length} tin đã ghi nhật ký`;
  }
  function syncMode() { // trang PO: chỉ hiện nút nhắc KT; trang phiếu thanh toán: hiện đủ
    if (!ui) return;
    const rec = isPayRecord(), fill = canFill(); // hiện đúng công cụ của màn hình đang mở
    ui.box.querySelectorAll('[data-a="fill"],[data-a="tpl"],[data-a="up"],[data-a="exp"],[data-a="clr"],.ov,.au,.ff').forEach((e) => { const t = e.closest("label,.r") || e; t.style.display = fill ? "" : "none"; });
    ui.box.querySelectorAll('[data-a="remind"]').forEach((e) => { const t = e.closest("label,.r") || e; t.style.display = rec ? "" : "none"; });
    const pk = isPicking();
    ui.box.querySelector(".zl").style.display = pk ? "" : "none"; // phiếu kho: hiện nút nhắn Zalo thủ kho
    ui.box.querySelector('[data-a="invoice"]').style.display = rec || pk ? "none" : "";
    if (!fill) ui.pick.style.display = "none";
  }
  let lastKey = "";
  function tick() {
    if (location.hostname !== "erp.dekko.com.vn") { bridge(); return; }
    sendToOpener(); requestBank();
    if (!PATH_RE.test(location.pathname + location.hash)) { if (ui) { ui.box.remove(); ui = null; } lastKey = ""; return; }
    build(); syncMode();
    if (!ui || !canFill() || !cfg().auto) return;
    const name = partnerName(); if (!name || !$(SEL.acc) || !$(SEL.holder) || !$(SEL.bank)) return;
    const key = location.pathname + "|" + name; if (key === lastKey) return; lastKey = key; runFill();
  }
  setInterval(tick, 1200); tick();
  if (!PATH_RE.test(location.pathname + location.hash)) hintNote();
})();
