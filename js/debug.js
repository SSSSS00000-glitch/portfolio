// ── DEBUG INSPECTOR ───────────────────────────────
(function () {
  let active = false;
  let hoveredEl = null;
  let pinnedEl = null;
  let card = null;
  let outline = null;
  let pinOutline = null;

  // Toolbar
  let toolbar = document.getElementById('dev-toolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'dev-toolbar';
    toolbar.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 99999;
      display: flex; gap: 6px; align-items: center;
      background: rgba(20,20,22,0.9); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 28px; padding: 5px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    `;
    document.body.appendChild(toolbar);
  }

  function toolbarBtn(id, icon, title) {
    var b = document.createElement('button');
    b.id = id; b.innerHTML = icon; b.title = title;
    b.style.cssText = `
      width: 36px; height: 36px; border-radius: 50%;
      background: transparent; color: rgba(255,255,255,0.7); border: none;
      font-size: 15px; cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    `;
    b.addEventListener('mouseenter', function() { if (!b.dataset.active) b.style.background = 'rgba(255,255,255,0.08)'; });
    b.addEventListener('mouseleave', function() { if (!b.dataset.active) b.style.background = 'transparent'; });
    return b;
  }

  var btn = toolbarBtn('debug-toggle', '🔍', 'Inspect element');
  toolbar.appendChild(btn);

  var dsBtn = toolbarBtn('ds-link', '📐', 'Design System');
  dsBtn.addEventListener('click', function() { window.location.href = 'design-system.html'; });
  toolbar.appendChild(dsBtn);

  // Colors
  var C = {
    accent: '#6ea8fe',
    green: '#7ec699',
    orange: '#e5a76b',
    purple: '#b8a9d4',
    pink: '#d4a0a0',
    dim: '#555',
    muted: '#888',
    bright: '#e8e4df',
    bg: '#18181c',
    bgAlt: '#222228',
    border: '#2a2a32',
  };

  // Card
  card = document.createElement('div');
  card.id = 'debug-card';
  card.style.cssText = `
    position: fixed; z-index: 99998; display: none;
    background: ${C.bg}; color: ${C.bright};
    border: 1px solid ${C.border};
    border-radius: 16px; padding: 0; min-width: 280px; max-width: 340px;
    font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 12px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.6);
    pointer-events: none; line-height: 1.5;
    overflow: hidden;
  `;
  document.body.appendChild(card);

  // Outline (hover)
  outline = document.createElement('div');
  outline.id = 'debug-outline';
  outline.style.cssText = `
    position: fixed; z-index: 99997; pointer-events: none; display: none;
    border: 1.5px solid ${C.accent}; border-radius: 4px;
    background: rgba(110,168,254,0.04);
    transition: all 0.06s ease;
  `;
  document.body.appendChild(outline);

  // Pin outline (clicked)
  pinOutline = document.createElement('div');
  pinOutline.id = 'debug-pin-outline';
  pinOutline.style.cssText = `
    position: fixed; z-index: 99996; pointer-events: none; display: none;
    border: 2px solid ${C.accent}; border-radius: 4px;
    background: rgba(110,168,254,0.06);
  `;
  document.body.appendChild(pinOutline);

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    active = !active;
    btn.dataset.active = active ? '1' : '';
    btn.style.background = active ? C.accent : 'transparent';
    btn.style.color = active ? '#111' : 'rgba(255,255,255,0.7)';
    document.body.style.cursor = active ? 'crosshair' : '';
    if (!active) {
      card.style.display = 'none';
      outline.style.display = 'none';
      pinOutline.style.display = 'none';
      hoveredEl = null;
      pinnedEl = null;
    }
  });

  function px(v) { return Math.round(parseFloat(v)); }

  function getSelector(el) {
    if (el.id) return '#' + el.id;
    var cls = Array.from(el.classList).filter(function(c) { return c !== 'visible' && c !== 'open' && c !== 'reveal'; }).join('.');
    var tag = el.tagName.toLowerCase();
    if (cls) return tag + '.' + cls;
    var parent = el.parentElement;
    if (parent) {
      var pc = Array.from(parent.classList).filter(function(c) { return c !== 'visible' && c !== 'reveal'; }).join('.');
      if (pc) return parent.tagName.toLowerCase() + '.' + pc + ' > ' + tag;
    }
    return tag;
  }

  function resolveToken(val) {
    var tokens = {
      '8px': '--space-xs', '12px': '--space-sm', '16px': '--space-md',
      '24px': '--space-lg', '32px': '--space-xl', '40px': '--space-2xl',
      '48px': '--space-3xl', '80px': '--space-4xl', '120px': '--space-section',
      '20px': '--radius / --text-title', '999px': '--radius-pill',
    };
    return tokens[val] || null;
  }

  function valWithToken(val) {
    var token = resolveToken(val);
    if (token) return val + ' <span style="color:' + C.purple + ';font-size:10px;">(' + token + ')</span>';
    return val;
  }

  function section(title) {
    return '<div style="padding:8px 16px 4px;font-size:9px;color:' + C.dim + ';font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">' + title + '</div>';
  }

  function row(label, value, color) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:3px 16px;gap:12px;">' +
      '<span style="color:' + (color || C.muted) + ';font-size:11px;">' + label + '</span>' +
      '<span style="color:' + C.bright + ';font-size:11px;font-weight:500;text-align:right;font-variant-numeric:tabular-nums;">' + value + '</span>' +
    '</div>';
  }

  function colorSwatch(color) {
    if (color === 'rgba(0, 0, 0, 0)' || color === 'transparent') return '';
    return '<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:' + color + ';border:1px solid rgba(255,255,255,0.1);vertical-align:middle;margin-right:4px;"></span>';
  }

  function buildCard(el) {
    var cs = getComputedStyle(el);
    var r = el.getBoundingClientRect();
    var sel = getSelector(el);
    var pt = px(cs.paddingTop), pr = px(cs.paddingRight), pb = px(cs.paddingBottom), pl = px(cs.paddingLeft);
    var mt = px(cs.marginTop), mr = px(cs.marginRight), mb = px(cs.marginBottom), ml = px(cs.marginLeft);

    // Header
    var html = '<div style="padding:14px 16px 10px;border-bottom:1px solid ' + C.border + ';">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="color:' + C.accent + ';font-weight:700;font-size:13px;font-family:monospace;">' + sel + '</span>' +
        '<span style="font-size:9px;color:' + C.dim + ';background:' + C.bgAlt + ';padding:2px 8px;border-radius:6px;">copied</span>' +
      '</div>' +
      '<div style="display:flex;gap:6px;margin-top:8px;">' +
        '<span style="background:' + C.bgAlt + ';padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;">' + Math.round(r.width) + ' x ' + Math.round(r.height) + '</span>' +
        '<span style="background:' + C.bgAlt + ';padding:3px 8px;border-radius:6px;font-size:11px;color:' + C.muted + ';">' + cs.display + '</span>' +
        (cs.position !== 'static' ? '<span style="background:' + C.bgAlt + ';padding:3px 8px;border-radius:6px;font-size:11px;color:' + C.orange + ';">' + cs.position + '</span>' : '') +
      '</div>' +
    '</div>';

    // Spacing
    var hasPad = pt || pr || pb || pl;
    var hasMar = mt || mr || mb || ml;
    var hasGap = cs.gap && cs.gap !== 'normal' && cs.gap !== '0px';
    if (hasPad || hasMar || hasGap) {
      html += section('Spacing');
      if (hasPad) html += row('Padding', valWithToken(pt + 'px') + '  ' + pr + '  ' + pb + '  ' + pl, C.green);
      if (hasMar) html += row('Margin', mt + '  ' + mr + '  ' + mb + '  ' + ml, C.orange);
      if (hasGap) html += row('Gap', valWithToken(cs.gap), C.purple);
    }

    // Layout
    if (cs.display.includes('flex') || cs.display.includes('grid')) {
      html += section('Layout');
      if (cs.display.includes('flex')) {
        html += row('Direction', cs.flexDirection);
        html += row('Align', cs.alignItems);
        if (cs.justifyContent !== 'normal') html += row('Justify', cs.justifyContent);
      }
      if (cs.display.includes('grid')) {
        html += row('Columns', cs.gridTemplateColumns);
      }
    }

    // Typography
    var font = cs.fontFamily.split(',')[0].replace(/['"]/g, '');
    html += section('Typography');
    html += row('Font', font + ' ' + cs.fontWeight, C.pink);
    html += row('Size', valWithToken(cs.fontSize), C.pink);
    html += row('Line-H', cs.lineHeight);
    if (cs.letterSpacing !== 'normal') html += row('Tracking', cs.letterSpacing);
    html += row('Color', colorSwatch(cs.color) + cs.color);

    // Visual
    var hasRadius = cs.borderRadius !== '0px';
    var hasBg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)';
    var hasBorder = cs.borderWidth !== '0px' && cs.borderStyle !== 'none';
    var hasOpacity = cs.opacity !== '1';
    if (hasRadius || hasBg || hasBorder || hasOpacity) {
      html += section('Visual');
      if (hasBg) html += row('Background', colorSwatch(cs.backgroundColor) + cs.backgroundColor);
      if (hasRadius) html += row('Radius', valWithToken(cs.borderRadius));
      if (hasBorder) html += row('Border', cs.borderWidth + ' ' + cs.borderStyle + ' ' + cs.borderColor);
      if (hasOpacity) html += row('Opacity', cs.opacity);
    }

    // Bottom padding
    html += '<div style="height:8px;"></div>';

    return { html: html, selector: sel };
  }

  function positionCard(e) {
    var cw = card.offsetWidth || 320, ch = card.offsetHeight || 300;
    var x = e.clientX + 16, y = e.clientY + 16;
    if (x + cw > window.innerWidth) x = e.clientX - cw - 16;
    if (y + ch > window.innerHeight) y = e.clientY - ch - 16;
    if (x < 8) x = 8; if (y < 8) y = 8;
    card.style.left = x + 'px'; card.style.top = y + 'px';
  }

  function showOutline(el, target) {
    var rect = el.getBoundingClientRect();
    target.style.display = 'block';
    target.style.left = rect.left + 'px';
    target.style.top = rect.top + 'px';
    target.style.width = rect.width + 'px';
    target.style.height = rect.height + 'px';
  }

  document.addEventListener('mousemove', function(e) {
    if (!active) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el.closest('#dev-toolbar') || el === card || card.contains(el) || el.id === 'debug-outline' || el.id === 'debug-pin-outline') return;
    if (el !== hoveredEl) {
      hoveredEl = el;
      showOutline(el, outline);
    }
    if (!pinnedEl) {
      var info = buildCard(el);
      card.innerHTML = info.html;
      card.style.display = 'block';
    }
    positionCard(e);
  });

  document.addEventListener('click', function(e) {
    if (!active) return;
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el.closest('#dev-toolbar')) return;
    e.preventDefault(); e.stopPropagation();

    pinnedEl = el;
    var info = buildCard(el);
    card.innerHTML = info.html;
    card.style.display = 'block';
    card.style.pointerEvents = 'auto';
    showOutline(el, pinOutline);
    positionCard(e);
    navigator.clipboard.writeText(info.selector).catch(function() {});
  }, true);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (pinnedEl) {
        pinnedEl = null;
        pinOutline.style.display = 'none';
        card.style.pointerEvents = 'none';
      } else if (card.style.display !== 'none') {
        card.style.display = 'none';
      } else if (active) {
        btn.click();
      }
    }
  });

  window.addEventListener('scroll', function() {
    if (pinnedEl) showOutline(pinnedEl, pinOutline);
  });
})();
