/* oebuylink 转链工具（纯本地生成，不上传任何数据）
 * 标签中英双语：按 <html lang> 自动切换。
 * 邀请码配置：后续要加邀请码时，只在下方 INVITE 里补 key 即可，链接模板自动拼接。
 */
(function () {
  'use strict';

  // 邀请码配置（当前为空 = 不拼接邀请码参数）
  var INVITE = {
    // oopbuy: 'TYZZSCDV0'
  };

  var CHANNELS = [
    { key: 'oopbuy',   name: 'OOPBUY',   color: '#7c5cff', tip: 'oopbuy.com' },
    { key: 'kakobuy',  name: 'KAKOBUY',  color: '#ff6b35', tip: 'kakobuy.com' },
    { key: 'uidbuy',   name: 'UIDBUY',   color: '#12b76a', tip: 'uidbuy.com' },
    { key: 'hipobuy',  name: 'HIPOBUY',  color: '#f04438', tip: 'hipobuy.com' },
    { key: 'litbuy',   name: 'LITBUY',   color: '#0ba5ec', tip: 'litbuy.com' },
    { key: 'boonbuy',  name: 'BOONBUY',  color: '#eaaa08', tip: 'boonbuy.com' }
  ];

  var I18N = {
    zh: {
      inputLabel: '输入微店商品链接（每行一个）',
      ph: 'https://weidian.com/item.html?itemID=7843481293',
      gen: '生成转链', clear: '清空', copied: '已复制',
      merged: '合并排版 · 每行一个渠道（可直接粘贴）',
      tsv: '批量表格 · 纯链接（可粘贴到 Excel / 飞书表格）',
      formula: '批量表格 · Google 表格公式（粘贴到表格即变超链接）',
      copyMerged: '复制合并排版', copyTsv: '复制表格（纯链接）', copyFormula: '复制公式',
      copy: '复制链接', open: '在新标签打开',
      empty: '点击上方「生成转链」查看结果',
      invalid: '未识别到 itemID，请检查链接格式',
      tip: '链接只在本机浏览器生成，不会上传到任何服务器'
    },
    en: {
      inputLabel: 'Paste Weidian product links (one per line)',
      ph: 'https://weidian.com/item.html?itemID=7843481293',
      gen: 'Generate links', clear: 'Clear', copied: 'Copied',
      merged: 'Merged text · one channel per line (ready to paste)',
      tsv: 'Spreadsheet · plain links (paste into Excel / Google Sheets)',
      formula: 'Spreadsheet · Google Sheets formulas (paste to become links)',
      copyMerged: 'Copy merged text', copyTsv: 'Copy table (plain)', copyFormula: 'Copy formulas',
      copy: 'Copy link', open: 'Open in new tab',
      empty: 'Click "Generate links" above to see results',
      invalid: 'No itemID found — please check the link format',
      tip: 'Links are generated locally in your browser; nothing is uploaded'
    }
  };

  function t() {
    var lang = (document.documentElement.getAttribute('lang') || 'zh').toLowerCase();
    return lang.indexOf('en') === 0 ? I18N.en : I18N.zh;
  }

  function extractItemID(url) {
    var m = url.match(/itemID[=&](\d+)/);
    return m ? m[1] : null;
  }

  function buildLinks(cleanUrl) {
    var id = extractItemID(cleanUrl);
    if (!id) return null;
    var canonical = 'https://weidian.com/item.html?itemID=' + id;
    function withInvite(base) {
      var code = INVITE.oopbuy;
      if (!code) return base;
      return base + (base.indexOf('?') >= 0 ? '&' : '?') + 'inviteCode=' + code;
    }
    return {
      oopbuy: withInvite('https://oopbuy.com/product/weidian/' + id),
      kakobuy: 'https://item.kakobuy.com/item/details?url=' + encodeURIComponent(canonical),
      uidbuy: 'https://www.uidbuy.com/product/3/' + id,
      hipobuy: 'https://hipobuy.com/product/weidian/' + id,
      litbuy: 'https://litbuy.com/product/weidian/' + id + '?linkSearch=true',
      boonbuy: 'https://boonbuy.com/product/weidian/' + id
    };
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function copyText(text, btn, okText) {
    var done = function () {
      if (!btn) return;
      var orig = btn.textContent;
      btn.textContent = okText || t().copied;
      setTimeout(function () { btn.textContent = orig; }, 1300);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }

  function makeBatchBox(title, text, btnText) {
    var T = t();
    var box = el('div', 'batch-box');
    box.appendChild(el('div', 'bt', title));
    var ta = document.createElement('textarea');
    ta.readOnly = true;
    ta.value = text;
    ta.style.cssText = 'height:96px;font-size:12px;background:#f6f8fc;color:#333;resize:vertical';
    box.appendChild(ta);
    var btn = el('button', 'btn btn-primary btn-sm', btnText);
    btn.onclick = function () { copyText(text, btn); };
    box.appendChild(btn);
    return box;
  }

  function openIcon(href) {
    var a = document.createElement('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.title = t().open; a.className = 'btn btn-ghost btn-sm';
    a.textContent = '↗';
    return a;
  }

  function generate() {
    var T = t();
    var raw = document.getElementById('oe-input').value.trim();
    var results = document.getElementById('oe-results');
    results.innerHTML = '';
    if (!raw) return;

    var lines = raw.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var mergedBlocks = [], linkRows = [], formulaRows = [];

    lines.forEach(function (url) {
      var links = buildLinks(url);
      if (!links) return;
      mergedBlocks.push(CHANNELS.map(function (ch) {
        return ch.name.toLowerCase() + ' link：' + links[ch.key];
      }).join('\n'));
      linkRows.push(CHANNELS.map(function (ch) { return links[ch.key]; }).join('\t'));
      formulaRows.push(CHANNELS.map(function (ch) {
        return '=HYPERLINK("' + links[ch.key] + '","' + ch.name + ' Buylink")';
      }).join('\t'));
    });

    if (!mergedBlocks.length) {
      results.appendChild(el('p', 'empty', T.invalid));
      return;
    }

    results.appendChild(makeBatchBox(T.merged, mergedBlocks.join('\n\n'), T.copyMerged));
    results.appendChild(makeBatchBox(T.tsv, linkRows.join('\n'), T.copyTsv));
    results.appendChild(makeBatchBox(T.formula, formulaRows.join('\n'), T.copyFormula));

    lines.forEach(function (url) {
      var links = buildLinks(url);
      if (!links) return;
      var card = el('div', 'res-item');
      card.appendChild(el('div', 'res-src', url));
      CHANNELS.forEach(function (ch) {
        var row = el('div', 'res-row');
        var nm = el('span', 'nm');
        var dot = el('i', 'dot');
        dot.style.background = ch.color;
        nm.appendChild(dot);
        nm.appendChild(document.createTextNode(ch.name));
        row.appendChild(nm);
        row.appendChild(el('span', 'lk', links[ch.key]));
        var open = openIcon(links[ch.key]);
        open.textContent = '';
        open.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5H4.2a1.2 1.2 0 0 0-1.2 1.2v7.1a1.2 1.2 0 0 0 1.2 1.2h7.1a1.2 1.2 0 0 0 1.2-1.2V9.5"/><path d="M9.8 3.5h2.7v2.7"/><path d="M12.3 3.7L7.4 8.6"/></svg>';
        row.appendChild(open);
        var btn = el('button', 'btn btn-ghost btn-sm', T.copy);
        (function (link, b) {
          b.onclick = function () { copyText(link, b); };
        })(links[ch.key], btn);
        row.appendChild(btn);
        card.appendChild(row);
      });
      results.appendChild(card);
    });
  }

  function clearAll() {
    document.getElementById('oe-input').value = '';
    document.getElementById('oe-results').innerHTML = '<p class="empty">' + t().empty + '</p>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var T = t();
    var box = document.getElementById('oe-tool');
    if (!box) return;
    var lab = document.querySelector('label[for=oe-input]');
    if (lab) lab.textContent = T.inputLabel;
    var ta = document.getElementById('oe-input');
    if (ta) ta.placeholder = T.ph;
    var gen = document.getElementById('oe-gen');
    if (gen) { gen.textContent = T.gen; gen.onclick = generate; }
    var clr = document.getElementById('oe-clear');
    if (clr) { clr.textContent = T.clear; clr.onclick = clearAll; }
    var tip = document.getElementById('oe-tip');
    if (tip) tip.textContent = T.tip;
    var res = document.getElementById('oe-results');
    if (res && !res.innerHTML.trim()) res.innerHTML = '<p class="empty">' + T.empty + '</p>';
  });
})();
