/**
 * 落地页「精选商品」实时同步。
 *
 * 数据源：主站 https://ores.cc/featured.json（由主站后台的「精选」设置决定：
 * 自动每日轮换 / 手工指定，数量可调；JSON 缓存 5 分钟）。
 *
 * 页面上的容器写法：
 *   <div class="pgrid" data-oe-featured="pcard">…静态兜底卡片…</div>
 *   <div class="grid g4" data-oe-featured="card">…静态兜底卡片…</div>
 *
 * 取不到数据（离线、被拦截、主站 5xx）时保留构建时写入的静态卡片，页面不会变空。
 * 主站取前 8 件 —— 「落地页全部取主站前 8 个精选」由这里统一控制。
 */
(function () {
  'use strict'

  var LIMIT = 8
  var ENDPOINT = 'https://ores.cc/featured.json'

  var grids = document.querySelectorAll('[data-oe-featured]')
  if (!grids.length) return

  var htmlLang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase()
  var lang = htmlLang.indexOf('zh') === 0 ? 'zh'
    : htmlLang.indexOf('es') === 0 ? 'es'
    : htmlLang.indexOf('pt') === 0 ? 'pt' : 'en'

  var SOLD = { en: '{n}+ sold', zh: '{n}+ 已售', es: '{n}+ vendidos', pt: '{n}+ vendidos' }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    })
  }

  function num(n) {
    var s = String(n || 0)
    return lang === 'en' || lang === 'zh' ? s : s.replace('.', ',')
  }

  function pickName(it) {
    if (lang === 'zh') return it.name_zh || it.name_en || ''
    return it.name_en || it.name_zh || ''
  }

  function pickTag(it) {
    var c = it.category || {}
    return lang === 'zh' ? (c.name_zh || c.name_en || '') : (c.name_en || c.name_zh || '')
  }

  function soldText(it) {
    if (!it.sold) return ''
    return SOLD[lang].replace('{n}', num(it.sold))
  }

  /* oebuylink 站群卡片（.pcard / .pimg / .pbody / .pname / .pmeta / .ptag / .psold） */
  function cardPcard(it) {
    var name = pickName(it)
    var sub = (lang === 'zh' && it.name_zh && it.name_zh !== name)
      ? '<span class="pname-zh">' + esc(it.name_zh) + '</span>' : ''
    var sold = soldText(it)
    return '<a class="pcard" href="' + esc(it.url) + '">' +
      '<span class="pimg"><img src="' + esc(it.image) + '" alt="' + esc(name) + '" loading="lazy" width="320" height="320"></span>' +
      '<span class="pbody"><span class="pname">' + esc(name) + '</span>' + sub +
      '<span class="pmeta"><span class="ptag">' + esc(pickTag(it)) + '</span>' +
      (sold ? '<span class="psold">' + esc(sold) + '</span>' : '') +
      '</span></span></a>'
  }

  /* kakobuyoe 站群卡片（.card / .card-media / .card-body / .card-cat / .card-name / .card-meta / .card-sold） */
  function cardCard(it) {
    var name = pickName(it)
    var sold = soldText(it)
    return '<a class="card" href="' + esc(it.url) + '">' +
      '<span class="card-media"><img src="' + esc(it.image) + '" alt="' + esc(name) + '" loading="lazy" width="480" height="480"></span>' +
      '<span class="card-body"><span class="card-cat">' + esc(pickTag(it)) + '</span>' +
      '<span class="card-name">' + esc(name) + '</span>' +
      '<span class="card-meta"><span>' + esc(pickTag(it)) + '</span>' +
      (sold ? '<span class="card-sold">' + esc(sold) + '</span>' : '<span class="card-sold"></span>') +
      '</span></span></a>'
  }

  function render(style, it) {
    return style === 'card' ? cardCard(it) : cardPcard(it)
  }

  fetch(ENDPOINT, { mode: 'cors', credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : null })
    .then(function (data) {
      var items = (data && data.items) || []
      if (!items.length) return
      items = items.slice(0, LIMIT)
      for (var i = 0; i < grids.length; i++) {
        var g = grids[i]
        var style = g.getAttribute('data-oe-featured') || 'pcard'
        var html = ''
        for (var j = 0; j < items.length; j++) html += render(style, items[j])
        g.innerHTML = html
      }
    })
    .catch(function () { /* 静默降级：保留静态卡片 */ })
})()
