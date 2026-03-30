// ── LIVE EDITOR ───────────────────────────────────
(function () {
  let editActive = false;
  let selectedEl = null;
  let panel = null;
  let changes = {};
  let highlight = null;
  let history = []; // undo stack

  const toolbar = document.getElementById('dev-toolbar');

  function toolbarBtn(id, icon, title) {
    const b = document.createElement('button');
    b.id = id; b.innerHTML = icon; b.title = title;
    b.style.cssText = `
      width: 40px; height: 40px; border-radius: 50%;
      background: transparent; color: #fff; border: none;
      font-size: 18px; cursor: pointer; transition: all 0.15s;
      display: flex; align-items: center; justify-content: center;
    `;
    b.addEventListener('mouseenter', () => { if (!b.dataset.active) b.style.background = 'rgba(255,255,255,0.08)'; });
    b.addEventListener('mouseleave', () => { if (!b.dataset.active) b.style.background = 'transparent'; });
    return b;
  }

  const btn = toolbarBtn('editor-toggle', '✏️', 'Edit element');
  const undoBtn = toolbarBtn('editor-undo', '↩', 'Undo last change');
  const saveBtn = toolbarBtn('editor-save', '💾', 'Save to files');
  undoBtn.style.display = 'none';
  saveBtn.style.display = 'none';
  toolbar.appendChild(btn);
  toolbar.appendChild(undoBtn);
  toolbar.appendChild(saveBtn);

  // Undo counter badge
  const undoBadge = document.createElement('span');
  undoBadge.style.cssText = `
    position:absolute;top:2px;right:2px;min-width:16px;height:16px;
    background:#b8a9c9;color:#1a1a1a;font-size:9px;font-weight:700;
    border-radius:8px;display:none;align-items:center;justify-content:center;
    padding:0 4px;font-family:Inter,sans-serif;
  `;
  undoBtn.style.position = 'relative';
  undoBtn.appendChild(undoBadge);

  highlight = document.createElement('div');
  highlight.style.cssText = `
    position: fixed; z-index: 99995; pointer-events: none; display: none;
    border: 2px solid #a8c4e0; background: rgba(168,196,224,0.06);
    border-radius: 4px; transition: all 0.1s;
  `;
  document.body.appendChild(highlight);

  panel = document.createElement('div');
  panel.id = 'editor-panel';
  panel.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 99999;
    background: #1e1e22; color: #e8e4df; border: 1px solid #2e2e34;
    border-radius: 20px; width: 300px;
    font-family: Inter, system-ui, sans-serif; font-size: 13px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.4);
    display: none; max-height: 85vh; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: #333 transparent;
  `;
  document.body.appendChild(panel);

  // Pastel palette
  const C = {
    pad: '#8bc5a3',    // soft green
    mar: '#e8b87a',    // soft orange
    gap: '#b8a9c9',    // soft purple
    size: '#a8c4e0',   // soft blue
    type: '#d4a0a0',   // soft pink
    color: '#c9bf8b',  // soft gold
    accent: '#a8c4e0',
    bg: '#26262c',
    border: '#36363e',
    muted: '#6e6e7a',
  };

  function getSelector(el) {
    if (el.id && !el.id.startsWith('debug') && !el.id.startsWith('editor') && !el.id.startsWith('dev-')) return `#${el.id}`;
    let cls = Array.from(el.classList).filter(c => c !== 'visible' && c !== 'open' && c !== 'reveal').join('.');
    let tag = el.tagName.toLowerCase();
    if (cls) return `${tag}.${cls}`;
    let parent = el.parentElement;
    if (parent) {
      let pc = Array.from(parent.classList).filter(c => c !== 'visible' && c !== 'reveal').join('.');
      if (pc) return `${parent.tagName.toLowerCase()}.${pc} > ${tag}`;
    }
    return tag;
  }

  function sliderField(label, value, min, max, color, onChange) {
    const px = Math.round(parseFloat(value)) || 0;
    const row = document.createElement('div');
    row.style.cssText = 'padding: 3px 16px;';

    const top = document.createElement('div');
    top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;';

    const lbl = document.createElement('span');
    lbl.style.cssText = `font-size:11px;color:${color};font-weight:500;`;
    lbl.textContent = label;

    const valInput = document.createElement('input');
    valInput.type = 'number';
    valInput.value = px;
    valInput.style.cssText = `
      width:50px;background:${C.bg};border:1px solid ${C.border};border-radius:8px;
      color:#fff;padding:3px 6px;font-size:11px;font-family:Inter,monospace;
      text-align:right;outline:none;-moz-appearance:textfield;
    `;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min; slider.max = max; slider.value = px;
    slider.style.cssText = `
      width:100%;height:3px;-webkit-appearance:none;appearance:none;
      background:${C.border};border-radius:2px;outline:none;cursor:pointer;
      accent-color:${color};
    `;

    const update = (v) => {
      const n = Math.round(parseFloat(v)) || 0;
      valInput.value = n; slider.value = n;
      onChange(n + 'px');
    };

    slider.addEventListener('input', () => update(slider.value));
    valInput.addEventListener('input', () => update(valInput.value));

    top.appendChild(lbl); top.appendChild(valInput);
    row.appendChild(top); row.appendChild(slider);
    return row;
  }

  function textField(label, value, color, onChange) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;padding:4px 16px;';

    const lbl = document.createElement('span');
    lbl.style.cssText = `color:${color || C.muted};font-size:11px;width:60px;flex-shrink:0;font-weight:500;`;
    lbl.textContent = label;

    const input = document.createElement('input');
    input.value = value;
    input.style.cssText = `
      flex:1;background:${C.bg};border:1px solid ${C.border};border-radius:8px;
      color:#eee;padding:4px 8px;font-size:11px;
      font-family:Inter,monospace;text-align:right;outline:none;
    `;
    input.addEventListener('focus', () => { input.style.borderColor = C.accent; });
    input.addEventListener('blur', () => { input.style.borderColor = C.border; });
    input.addEventListener('input', () => onChange(input.value));

    row.appendChild(lbl); row.appendChild(input);
    return row;
  }

  function sectionHeader(text, color) {
    const h = document.createElement('div');
    h.style.cssText = `padding:10px 16px 2px;font-size:10px;color:${color || C.muted};font-weight:600;text-transform:uppercase;letter-spacing:0.08em;`;
    h.textContent = text;
    return h;
  }

  function divider() {
    const d = document.createElement('div');
    d.style.cssText = `height:1px;background:${C.border};margin:6px 16px;`;
    return d;
  }

  function pushUndo(el, prop, oldVal) {
    history.push({ el, prop, oldVal, selector: getSelector(el) });
    undoBtn.style.display = 'flex';
    undoBadge.style.display = 'flex';
    undoBadge.textContent = history.length;
  }

  function showPanel(el) {
    selectedEl = el;
    const cs = getComputedStyle(el);
    const sel = getSelector(el);
    const r = el.getBoundingClientRect();

    highlight.style.display = 'block';
    highlight.style.left = r.left + 'px'; highlight.style.top = r.top + 'px';
    highlight.style.width = r.width + 'px'; highlight.style.height = r.height + 'px';

    panel.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.style.cssText = `padding:16px 16px 12px;border-bottom:1px solid ${C.border};`;
    header.innerHTML = `
      <div style="color:${C.accent};font-weight:700;font-size:14px;margin-bottom:2px;">${sel}</div>
      <div style="color:${C.muted};font-size:11px;">${Math.round(r.width)} × ${Math.round(r.height)}</div>
    `;
    panel.appendChild(header);

    // Text
    if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
      panel.appendChild(sectionHeader('Text', C.muted));
      const ta = document.createElement('textarea');
      ta.value = el.textContent.trim();
      ta.style.cssText = `
        display:block;width:calc(100% - 32px);margin:4px 16px 8px;background:${C.bg};
        border:1px solid ${C.border};border-radius:10px;color:#fff;padding:8px;font-size:12px;
        font-family:Inter,sans-serif;resize:vertical;min-height:36px;outline:none;
      `;
      ta.addEventListener('input', () => { el.textContent = ta.value; });
      panel.appendChild(ta);
      panel.appendChild(divider());
    }

    // Padding
    panel.appendChild(sectionHeader('Padding', C.pad));
    [['Top','padding-top'], ['Right','padding-right'], ['Bottom','padding-bottom'], ['Left','padding-left']].forEach(([lbl, prop]) => {
      const csKey = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const oldVal = cs[csKey];
      panel.appendChild(sliderField(lbl, oldVal, 0, 400, C.pad, (v) => {
        pushUndo(el, csKey, el.style[csKey] || oldVal);
        el.style[csKey] = v; track(sel, prop, v); updateHighlight();
      }));
    });
    panel.appendChild(divider());

    // Margin
    panel.appendChild(sectionHeader('Margin', C.mar));
    [['Top','margin-top'], ['Right','margin-right'], ['Bottom','margin-bottom'], ['Left','margin-left']].forEach(([lbl, prop]) => {
      const csKey = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const oldVal = cs[csKey];
      panel.appendChild(sliderField(lbl, oldVal, 0, 400, C.mar, (v) => {
        pushUndo(el, csKey, el.style[csKey] || oldVal);
        el.style[csKey] = v; track(sel, prop, v); updateHighlight();
      }));
    });
    panel.appendChild(divider());

    // Gap
    panel.appendChild(sectionHeader('Gap', C.gap));
    const gapOld = cs.gap !== 'normal' ? cs.gap : '0px';
    panel.appendChild(sliderField('Gap', gapOld, 0, 300, C.gap, (v) => {
      pushUndo(el, 'gap', el.style.gap || gapOld);
      el.style.gap = v; track(sel, 'gap', v); updateHighlight();
    }));
    panel.appendChild(divider());

    // Size
    panel.appendChild(sectionHeader('Size', C.size));
    [['W','width'], ['H','height']].forEach(([lbl, prop]) => {
      const oldVal = cs[prop];
      panel.appendChild(sliderField(lbl, oldVal, 0, 2000, C.size, (v) => {
        pushUndo(el, prop, el.style[prop] || oldVal);
        el.style[prop] = v; track(sel, prop, v); updateHighlight();
      }));
    });
    panel.appendChild(textField('Radius', cs.borderRadius, C.size, (v) => {
      pushUndo(el, 'borderRadius', el.style.borderRadius || cs.borderRadius);
      el.style.borderRadius = v; track(sel, 'border-radius', v);
    }));
    panel.appendChild(divider());

    // Typography
    panel.appendChild(sectionHeader('Type', C.type));
    [['Size','font-size'], ['Weight','font-weight'], ['Line-H','line-height'], ['Spacing','letter-spacing']].forEach(([lbl, prop]) => {
      const csKey = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      panel.appendChild(textField(lbl, cs[csKey], C.type, (v) => {
        pushUndo(el, csKey, el.style[csKey] || cs[csKey]);
        el.style[csKey] = v; track(sel, prop, v);
      }));
    });
    panel.appendChild(divider());

    // Color
    panel.appendChild(sectionHeader('Color', C.color));
    [['Text','color'], ['Bg','backgroundColor']].forEach(([lbl, prop]) => {
      panel.appendChild(textField(lbl, cs[prop], C.color, (v) => {
        pushUndo(el, prop, el.style[prop] || cs[prop]);
        el.style[prop] = v; track(sel, prop === 'backgroundColor' ? 'background-color' : prop, v);
      }));
    });

    panel.style.display = 'block';
    saveBtn.style.display = 'flex';
  }

  function updateHighlight() {
    if (!selectedEl) return;
    const r = selectedEl.getBoundingClientRect();
    highlight.style.left = r.left + 'px'; highlight.style.top = r.top + 'px';
    highlight.style.width = r.width + 'px'; highlight.style.height = r.height + 'px';
  }

  function track(sel, prop, val) {
    if (!changes[sel]) changes[sel] = {};
    changes[sel][prop] = val;
    let dot = saveBtn.querySelector('.unsaved-dot');
    if (!dot) {
      dot = document.createElement('span');
      dot.className = 'unsaved-dot';
      dot.style.cssText = `position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:${C.type};`;
      saveBtn.style.position = 'relative';
      saveBtn.appendChild(dot);
    }
  }

  // Toggle
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    editActive = !editActive;
    btn.dataset.active = editActive ? '1' : '';
    btn.style.background = editActive ? C.accent : 'transparent';
    btn.style.color = editActive ? '#1a1a1a' : '#fff';
    document.body.style.cursor = editActive ? 'pointer' : '';
    if (!editActive) {
      panel.style.display = 'none';
      highlight.style.display = 'none';
      if (!Object.keys(changes).length) { saveBtn.style.display = 'none'; }
      if (!history.length) { undoBtn.style.display = 'none'; }
    }
  });

  // Click
  document.addEventListener('click', (e) => {
    if (!editActive) return;
    const el = e.target;
    if (el.closest('#editor-panel') || el.closest('#dev-toolbar')) return;
    e.preventDefault(); e.stopPropagation();
    showPanel(el);
  }, true);

  // Undo
  undoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!history.length) return;
    const last = history.pop();
    last.el.style[last.prop] = last.oldVal;
    undoBadge.textContent = history.length;
    if (!history.length) {
      undoBtn.style.display = 'none';
      undoBadge.style.display = 'none';
    }
    // Re-show panel if same element
    if (selectedEl === last.el) showPanel(last.el);
    updateHighlight();
  });

  // Ctrl+Z / Cmd+Z
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && editActive && history.length) {
      e.preventDefault();
      undoBtn.click();
    }
    if (e.key === 'Escape' && panel.style.display !== 'none') {
      panel.style.display = 'none'; highlight.style.display = 'none';
    }
  });

  // Save
  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!Object.keys(changes).length) return;
    saveBtn.innerHTML = '⏳';
    fetch('/save-css', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes }),
    })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        saveBtn.innerHTML = '✅';
        const dot = saveBtn.querySelector('.unsaved-dot');
        if (dot) dot.remove();
        console.log('%c💾 Saved:', 'color:#8bc5a3;font-weight:bold', changes);
        changes = {};
        setTimeout(() => { saveBtn.innerHTML = '💾'; }, 1500);
      } else {
        saveBtn.innerHTML = '❌';
        setTimeout(() => { saveBtn.innerHTML = '💾'; }, 2000);
      }
    })
    .catch(() => {
      saveBtn.innerHTML = '❌';
      setTimeout(() => { saveBtn.innerHTML = '💾'; }, 2000);
    });
  });

  window.addEventListener('scroll', updateHighlight);
})();
