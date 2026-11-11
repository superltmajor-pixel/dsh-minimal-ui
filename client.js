window.__ModuleLoader__.load({
  id: 'dsh-minimal-ui',
  factory(require) {
    // Keep initialization failures visible without logging ordinary renders or activations.
    const bootMark = (tag, extra) => {
      try {
        if (!tag.startsWith('apply:throw ')) return;
        console.error('[minimal-ui 0.10.35] ' + tag + (extra === void 0 ? '' : ' -> ' + String(extra)));
      } catch (error) {}
    };
    const describeError = (error) => {
      try {
        const lines = String(error && error.stack ? error.stack : error).split(String.fromCharCode(10));
        const frame = lines.find((line) => line.indexOf('dsh-minimal-ui') >= 0 || line.indexOf('client.js') >= 0) || lines[0];
        return String((error && error.name) || 'Error') + ': ' + String((error && error.message) || '') + ' @ ' + String(frame).trim();
      } catch (nested) {
        return 'unreadable-error';
      }
    };
    // cordis throws 'cannot get property "x" without inject' on an undeclared service
    // read; reflect.get is the documented non-throwing lookup (undefined when absent).
    const peekService = (ctx, name) => {
      try {
        return typeof ctx.reflect?.get === 'function' ? ctx.reflect.get(name) : void 0;
      } catch (error) {
        return void 0;
      }
    };
    bootMark('factory:enter');
    try { globalThis.__minimalUiMark = bootMark; } catch (error) {}
    const React = require('react');
    bootMark('factory:react', typeof React);
    // Scoped to the verified 0.2.1-rc.5 host modules. Unknown markup is left alone.
    const css = `
/* Typography: keep the crisp Segoe UI for Latin, swap the heavy Microsoft YaHei for
   the locally installed Noto Sans SC, and lift the body/code size a notch. The host
   derives every line-height from these two size variables, so nothing else to touch. */
:root {
  --dsh-font-family-text: "Segoe UI", "Noto Sans SC", "Microsoft YaHei", sans-serif;
  --dsh-font-family-code: "Cascadia Code", "Cascadia Mono", Consolas, "Noto Sans SC", monospace;
  --dsh-content-font-size: 15px;
  /* Code size drives both code blocks (this value) and inline code (12px + delta):
     13px here means 13px blocks and 14px inline chips, which is what sits well next
     to 15px prose. At the old 12px the inline chips read like footnotes. */
  --dsh-code-font-size: 13px;
  /* Tables sat 2px below the body and read small next to 15px prose. */
  --dsw-font-markdown-table: 14px / calc(22px + var(--dsh-content-font-delta-secondary, 0px)) var(--dsw-font-family);
  --dsw-font-markdown-table-font-size: 14px;
  --dsw-font-markdown-table-head: 500 14px / calc(22px + var(--dsh-content-font-delta-secondary, 0px)) var(--dsw-font-family);
  --dsw-font-markdown-table-head-font-size: 14px;
  /* Chinese has no true italic: emphasis falls back to KaiTi and stays upright, while
     Latin keeps the real Segoe UI italic. Traditional Chinese typographic emphasis. */
  --dsw-font-markdown-base-italic-font-family: "Segoe UI", "KaiTi", "Noto Sans SC", serif;
  --dsw-font-markdown-base-strong-italic-font-family: "Segoe UI", "KaiTi", "Noto Sans SC", serif;
  --dsw-font-markdown-small-italic-font-family: "Segoe UI", "KaiTi", "Noto Sans SC", serif;
}
/* Do not slant a CJK face that has no italic; KaiTi above already reads as emphasis. */
em, i { font-synthesis: none; }
table, th, td { font-variant-numeric: tabular-nums; }
/* Inline code: the grey pill around every identifier turns a Chinese sentence into a
   row of stickers, and in tables those pills fight the cell borders. Keep the mono face
   and a quiet tint, drop the box. */
:not(pre) > code {
  background: none !important;
  border: 0 !important;
  border-radius: 0 !important;
  padding: 0 !important;
  color: var(--dsw-alias-label-secondary) !important;
}
/* Composer candidate menu: retain the theme hue but force an opaque surface.
   The stock menu uses a translucent MenuSurface, which exposes transcript text. */
[data-composer-overlay] [data-trigger-menu] {
  --dsw-specific-menu: rgb(from var(--dsw-alias-bg-overlay) r g b / 1);
  background: var(--dsw-specific-menu) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  opacity: 1;
}
/* Send: the filled blue disc competes with the reply it is about to send. Draw the arrow
   in the theme ink and show a ring only while the pointer is on it. The glyph is an inline
   SVG on currentColor, so colour alone switches light/dark ink. */
.GRgSLq_primary {
  background: transparent;
  color: var(--dsw-alias-label-primary);
  transition: box-shadow 120ms ease, color 120ms ease, background-color 120ms ease;
}
.GRgSLq_primary:hover:not(:disabled) {
  background: transparent;
  color: var(--dsw-alias-label-primary);
  box-shadow: inset 0 0 0 1.5px var(--dsw-alias-button-info-fill);
}
.GRgSLq_primary:disabled { color: var(--dsw-alias-label-tertiary); }
/* Right panel guide: the oversized compass says nothing the title does not. */
.p2k40q_hero { display: none; }
/* Right panel guide cards: the shipped artwork mixes a yellow folder, a coloured chart, a blue
   prompt and blue globe with grey line glyphs, so the list reads as four styles. Hide each
   artwork and paint one stroke family through a mask: the ink follows currentColor, so light
   and dark themes need no second rule. */
:is([data-sidebar-right-guide-entry="files"],
    [data-sidebar-right-guide-entry="forge-panel"],
    [data-sidebar-right-guide-entry="dsh-context"],
    [data-sidebar-right-guide-entry="terminal"],
    [data-sidebar-right-guide-entry="browser"],
    [data-sidebar-right-guide-entry="session-inspector-log"]) > .p2k40q_entryIcon > * {
  display: none !important;
}
:is([data-sidebar-right-guide-entry="files"],
    [data-sidebar-right-guide-entry="forge-panel"],
    [data-sidebar-right-guide-entry="dsh-context"],
    [data-sidebar-right-guide-entry="terminal"],
    [data-sidebar-right-guide-entry="browser"],
    [data-sidebar-right-guide-entry="session-inspector-log"]) > .p2k40q_entryIcon::after {
  content: "";
  width: 22px;
  height: 22px;
  background-color: currentColor;
  -webkit-mask-image: var(--minimalui-guide-glyph);
  mask-image: var(--minimalui-guide-glyph);
  -webkit-mask-size: 22px 22px;
  mask-size: 22px 22px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}
[data-sidebar-right-guide-entry="files"] {
  --minimalui-guide-glyph: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 8.4A1.9 1.9 0 0 1 5.4 6.5h3.3c.5 0 1 .2 1.3.6l1.2 1.2h7.4a1.9 1.9 0 0 1 1.9 1.9v7.4a1.9 1.9 0 0 1-1.9 1.9H5.4a1.9 1.9 0 0 1-1.9-1.9z'/%3E%3C/svg%3E");
}
[data-sidebar-right-guide-entry="forge-panel"] {
  --minimalui-guide-glyph: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='6.5' cy='6.5' r='2.4'/%3E%3Ccircle cx='17.5' cy='17.5' r='2.4'/%3E%3Cpath d='M6.5 8.9v2.4a3.4 3.4 0 0 0 3.4 3.4h4.2'/%3E%3Cpath d='M17.5 15.1V8.9'/%3E%3C/svg%3E");
}
[data-sidebar-right-guide-entry="dsh-context"] {
  --minimalui-guide-glyph: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3.8 20.2 8 12 12.2 3.8 8z'/%3E%3Cpath d='m3.8 12 8.2 4.2 8.2-4.2'/%3E%3Cpath d='m3.8 16 8.2 4.2 8.2-4.2'/%3E%3C/svg%3E");
}
[data-sidebar-right-guide-entry="terminal"] {
  --minimalui-guide-glyph: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4.5 7.5 4.5 4.5-4.5 4.5'/%3E%3Cpath d='M12 16.5h7.5'/%3E%3C/svg%3E");
}
/* The terminal card is its own component (TerminalGuide in ui-sidebar-terminal, class -4GESq_icon)
   rather than the shipped guide row, so it needs the same treatment under its own class name. */
[data-sidebar-right-guide-entry="terminal"] > [class~="-4GESq_icon"] > * {
  display: none !important;
}
[data-sidebar-right-guide-entry="terminal"] > [class~="-4GESq_icon"]::after {
  content: "";
  width: 22px;
  height: 22px;
  background-color: currentColor;
  -webkit-mask-image: var(--minimalui-guide-glyph);
  mask-image: var(--minimalui-guide-glyph);
  -webkit-mask-size: 22px 22px;
  mask-size: 22px 22px;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}
[data-sidebar-right-guide-entry="browser"] {
  --minimalui-guide-glyph: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='8.2'/%3E%3Cpath d='M3.8 12h16.4'/%3E%3Cpath d='M12 3.8c2.2 2.3 3.4 5.1 3.4 8.2s-1.2 5.9-3.4 8.2c-2.2-2.3-3.4-5.1-3.4-8.2S9.8 6.1 12 3.8z'/%3E%3C/svg%3E");
}
[data-sidebar-right-guide-entry="session-inspector-log"] {
  --minimalui-guide-glyph: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 12h3.8l2.4-5.6 4 11.2 2.4-5.6h4.4'/%3E%3C/svg%3E");
}
/* Sidebar: the brand row is itself the New Session button, so the full-width New Session card right
   under it calls the same action twice and reads as a second header. Hide only the wide variant (the
   one that renders a label span); the collapsed rail keeps its icon button. */
.wtg9ga_newSession:has(.wtg9ga_newSessionLabel) { display: none; }
/* With that card gone the panel list hugs the brand row; give the gap back on the wide rail only,
   enough that the first panel row lines up with the first card of the right guide column. */
.wtg9ga_root:not(.wtg9ga_collapsed) .wtg9ga_panelList { margin-top: 44px; }
/* Right guide: the shipped layout centres the card stack in the panel, which drops the first card
   far below the sidebar's first row. Start the stack at the top instead and pull it up to the line. */
.p2k40q_guide { justify-content: flex-start; padding-top: 43px; }
/* More tools grows with its rows and then runs past the column's bottom edge. Cap it against the
   viewport and let the wheel scroll the rows; the panel keeps its width, every row stays reachable,
   and the thin themed thumb replaces the floating overlay scrollbar. */
.p2k40q_moreMenu {
  max-height: min(62vh, 420px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--dsw-alias-border-l2) transparent;
}
.p2k40q_moreMenu::-webkit-scrollbar { width: 8px; }
.p2k40q_moreMenu::-webkit-scrollbar-thumb { background: var(--dsw-alias-border-l2); border-radius: 999px; }
.p2k40q_moreMenu::-webkit-scrollbar-track { background: transparent; }
/* Right header utilities: the open-in-app folder button duplicates the sidebar files entry,
   which stays available; hide only that Menu so the remaining actions keep their spacing. */
.an3WzG_headerUtilities .mOxcpG_menuAnchor:has([data-open-target="directory"]) { display: none; }
/* Markdown tables sit in a wrapper the host gives no margin, so a table collapses against the
  16px paragraph margin above it. Give the block real space above and below (compact tool output
  keeps its own tighter rule, which wins by specificity). */
._tableScroll_rve47_199 { margin: 20px 0; }
/* A one-character "#" column inherits the host 100px min-width, so the number drifts far from
  the cell that follows, while 10px cell padding leaves the rows cramped. Let the first column
  shrink to its content and loosen the rows so they read as separate records. */
._tableScroll_rve47_199 :is(th, td) { padding-top: 14px; padding-bottom: 14px; }
._tableScroll_rve47_199 :is(th, td):first-child { min-width: 0; padding-right: 12px; }
/* Conversation column scrollbar: the host keeps a stable gutter and paints the track even on a
  page with nothing to scroll (the new-session hero centers its content in an auto-scroller), so a
  dead-looking bar floats at the window edge. Keep the gutter and the wheel behaviour, but paint
  the thumb only while the column is hovered or focused. */
.an3WzG_scrollBody::-webkit-scrollbar { width: 8px; height: 8px; }
.an3WzG_scrollBody::-webkit-scrollbar-track { background: transparent; }
.an3WzG_scrollBody::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; transition: background-color 140ms ease; }
.an3WzG_scrollBody:hover::-webkit-scrollbar-thumb,
.an3WzG_scrollBody:focus-within::-webkit-scrollbar-thumb { background: var(--dsw-alias-scrollbar-bg-l2); }
.an3WzG_scrollBody::-webkit-scrollbar-thumb:hover { background: var(--dsw-alias-scrollbar-hover-l2); }

/* Transcript width: without a dragged preference the host caps the column at 64% of the
  conversation area (clamped to 680-920px), so collapsing both sidebars only buys blank margins
  instead of a wider conversation. Pin it to the widest the host itself allows - its drag handle
  maxes out at the area width minus CONTENT_EDGE_BUDGET (176px), floored at CONTENT_MIN (640px).
  Mirroring that formula reuses the host's own geometry variable, so the column is as wide as the
  handle can ever be dragged, never wider. */
.an3WzG_body { --dsh-chat-content-width: max(640px, calc(var(--dsh-conversation-column-width, 0px) - 176px)) !important; }

/* The empty new-session page must not scroll at all: a page with nothing below it should not
  drift under the wheel. Only the hero phase is pinned; a session with real content keeps its
  own scroll. */
.an3WzG_root[data-phase="hero"] .an3WzG_scrollBody,
.an3WzG_embeddedBody[data-content-phase="hero"] .an3WzG_scrollBody { overflow-y: hidden; }

/* A second, page-level scrollbar: the transcript scroller chains its wheel to the document, so once
  a session is scrolled to the bottom the whole window keeps going and lifts the app off the bottom
  edge. Pin the document (it has no scrollable content of its own — every view scrolls inside) and
  keep the column scroller from handing its overflow to any ancestor. */
html, body { overflow: hidden; overscroll-behavior: none; }
.an3WzG_scrollBody { overscroll-behavior-y: contain; }
/* Transcript top edge: rows scroll under the session header and get sliced on a hard line at the
   pane top. Fade that first band so content dissolves into the header instead, the way the rows
   leave the viewport. The hero page keeps its own centred composition, so it is left alone. */
.an3WzG_root:not([data-phase="hero"]) .an3WzG_scrollBody,
.an3WzG_embeddedBody:not([data-content-phase="hero"]) .an3WzG_scrollBody {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 12px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 12px);
}
/* A hairline shadow under the header gives the seam depth once the fade is in place; it is drawn
   on the header itself so it never covers a first row. */
.an3WzG_header { box-shadow: 0 3px 8px -7px rgba(0, 0, 0, 0.35); }

/* Composer model seat: the host prints the whole provider/model name plus the effort level next to
  a 16px glyph, which makes the quietest control in the composer the longest text. Show the glyph
  only — the host already publishes display tokens for the icon and the effort caption, and the
  trigger keeps its title attribute, so the full name still shows on hover. */
:root {
  --dsh-composer-model-icon-display: block;
  --dsh-composer-model-text-display: none;
}
._9r0rkG_triggerLabel { display: none; }
._9r0rkG_trigger { max-width: none; gap: 2px; padding: 0 4px; }
/* User bubble: 20px radius with 16px side padding reads heavier than the reply text it answers. */
[data-message-bubble]._bubble_1sgyj_1 { border-radius: var(--dsw-radius-lg); padding: 8px 12px; }
@media (hover: hover) and (pointer: fine) {
  [data-actions-reveal] ._1KfHza_actions {
    opacity: 0 !important;
    pointer-events: none;
    transition: opacity 120ms ease;
  }
  [data-actions-reveal]:hover ._1KfHza_actions,
  [data-actions-reveal]:focus-within ._1KfHza_actions,
  [data-chat-flow-kind]:hover ._1KfHza_actions,
  [data-chat-flow-kind]:focus-within ._1KfHza_actions,
  *:hover + [data-turn-tail] ._1KfHza_actions {
    opacity: 1 !important;
    pointer-events: auto;
  }
  /* User bubbles carry the same action row without the reveal attribute. */
  .LOmM4q_userRow ._1KfHza_actions {
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }
  .LOmM4q_userRow:hover ._1KfHza_actions,
  .LOmM4q_userRow:focus-within ._1KfHza_actions {
    opacity: 1;
    pointer-events: auto;
  }
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_headerActions:not(.GAkraW_headerActionsHidden),
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_search:not(.GAkraW_searchExpanded) {
    opacity: 0;
    pointer-events: none;
  }
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionHeader:hover .GAkraW_headerActions:not(.GAkraW_headerActionsHidden),
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionHeader:focus-within .GAkraW_headerActions:not(.GAkraW_headerActionsHidden),
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_headerActions:has([aria-expanded="true"]),
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionHeader:hover .GAkraW_search,
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionHeader:focus-within .GAkraW_search {
    opacity: 1;
    pointer-events: auto;
  }
  /* The row's hover card already states the time, so the inline label is redundant. */
  .wnFoaW_sessionRow .wnFoaW_time {
    display: none;
  }
  /* Session rows rest with the title only: trailing badges fade in with the row
     actions. A pinned row keeps its pin marker visible. */
  .wnFoaW_sessionRow .wnFoaW_rowResting > :not(.wnFoaW_pinIndicator) {
    opacity: 0;
    transition: opacity 120ms ease;
  }
  .wnFoaW_sessionRow:hover .wnFoaW_rowResting > *,
  .wnFoaW_sessionRow:focus-within .wnFoaW_rowResting > * {
    opacity: 1;
  }
  /* The host swaps its resting cell out on hover; keep it so those badges stay readable. */
  .wnFoaW_sessionRow:hover .wnFoaW_rowResting,
  .wnFoaW_sessionRow:focus-within .wnFoaW_rowResting {
    display: inline-flex;
  }
  /* The section label repeats what the groups below already show, so it is gone. */
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionLabel {
    display: none;
  }
  /* Section header: only the buttons remain, and only on hover. */
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionHeader > * {
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease;
  }
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionHeader:hover > *,
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionHeader:focus-within > *,
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionHeader > .GAkraW_headerActions:has([aria-expanded="true"]),
  /* An open search field or menu must stay usable after the pointer leaves. */
  .GAkraW_root:not(.GAkraW_rail) .GAkraW_sectionHeader > .GAkraW_searchSlot:has(.GAkraW_searchExpanded) {
    opacity: 1;
    pointer-events: auto;
  }
}
.GRgSLq_root:has(.minimalui-stats) [data-composer-stat],
.GRgSLq_root:has(.minimalui-stats) [data-composer-dock] .A6Bq1a_root { display: none; }
/* Flatten only the verified dock while the replacement is mounted. Other entries survive. */
.GRgSLq_root:has(.minimalui-stats) > [data-composer-dock] { display: contents; }
.minimalui-stats { display: inline-flex; align-items: center; gap: 0; flex: none; }
.minimalui-stat { display: grid; place-items: center; width: 28px; height: 28px; padding: 0;
  background: transparent; border: 0; border-radius: var(--dsw-radius-sm); cursor: pointer;
  color: var(--dsw-alias-label-secondary); opacity: .6; }
.minimalui-stat:hover, .minimalui-stat:focus-visible, .minimalui-stat[aria-expanded="true"] {
  opacity: 1; background: var(--dsw-alias-bg-layer-2); }
.minimalui-stat:focus-visible { outline: 1.5px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.minimalui-stat[data-warning] { color: var(--dsw-alias-state-warn-primary); opacity: 1; }
.minimalui-stat svg { width: 15px; height: 15px; }
.minimalui-popup { position: fixed; inset: auto; margin: 0; z-index: 1200; box-sizing: border-box;
  max-width: calc(100vw - 24px); max-height: calc(100dvh - 24px); overflow: auto;
  background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary);
  border: 1px solid var(--dsw-alias-border-l1); border-radius: var(--dsw-radius-md); padding: 8px 10px;
  font-family: inherit; font-size: 12px; line-height: 20px; font-weight: 400; text-align: left; }
.minimalui-popup[role="tooltip"] { white-space: nowrap; }
.minimalui-popup[role="dialog"] { width: 270px; padding: 12px; }
.minimalui-popup:focus { outline: none; }
.minimalui-popup h3 { margin: 0 0 8px; font: inherit; font-weight: 600; }
.minimalui-popup dl { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 5px 16px; margin: 0; }
.minimalui-popup dt { color: var(--dsw-alias-label-secondary); }
.minimalui-popup dd { margin: 0; font-variant-numeric: tabular-nums; }
.minimalui-popup p { margin: 6px 0 0; color: var(--dsw-alias-label-secondary); }
/* Host row measurement already collapses the model label when controls need room. */
.GRgSLq_root:has(.minimalui-stats) .GRgSLq_tools { gap: 8px; }
.GRgSLq_root:has(.minimalui-stats) .GRgSLq_modes { min-width: 0; }
/* Lift the composer off the window edge (host ships 4px) and trim its vertical bulk. */
.GRgSLq_root { padding-bottom: 24px; }
.GRgSLq_card { padding-top: 6px; gap: 8px; }
.GRgSLq_input { min-height: 32px; }
.GRgSLq_row { padding-top: 0; padding-bottom: 4px; }
/* Empty-state hint stays quiet until hovered or focused, hero included.
   Reveal at 70% opacity so the theme-aware hint remains visually subdued. */
.GRgSLq_root [data-composer-placeholder] { opacity: 0; transition: opacity 140ms ease; }
.GRgSLq_root .GRgSLq_input p:last-child::after { opacity: 0; transition: opacity 140ms ease; }
.GRgSLq_card:hover [data-composer-placeholder],
.GRgSLq_card:focus-within [data-composer-placeholder],
.GRgSLq_card:hover .GRgSLq_input p:last-child::after,
.GRgSLq_card:focus-within .GRgSLq_input p:last-child::after { opacity: .7; }
/* Permission control: icon only; its label surfaces on hover/focus without reflow. */
.GRgSLq_modes ._86kJGG_trigger { position: relative; }
.GRgSLq_modes ._86kJGG_triggerLabel {
  position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
  max-width: 240px; overflow: visible; white-space: nowrap; padding: 2px 8px;
  border-radius: 6px; border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary);
  box-shadow: 0 4px 16px rgb(0 0 0 / 18%); visibility: hidden; opacity: 0;
  pointer-events: none; transition: opacity 120ms ease, visibility 0s linear 120ms;
}
.GRgSLq_modes ._86kJGG_trigger:hover ._86kJGG_triggerLabel,
.GRgSLq_modes ._86kJGG_trigger:focus-visible ._86kJGG_triggerLabel {
  visibility: visible; opacity: 1; transition: opacity 120ms ease;
}
/* Hide the host panel only while this composer has a mounted replacement. */
[data-composer-seat]:has([data-minimalui-todo-owner]) [data-testid="todo-panel"]:not(.minimalui-todo-root) { display: none !important; }
/* Task panel keeps the host look and gains an explicit dismiss control. */
.minimalui-todo-row { display: flex; align-items: center; gap: 6px; }
.minimalui-todo-row > .DXuOLW_header { flex: 1 1 auto; min-width: 0; width: auto; }
.minimalui-todo-close { display: grid; place-items: center; flex: none; width: 24px; height: 24px;
  padding: 0; border: 0; border-radius: var(--dsw-radius-sm); background: transparent; cursor: pointer;
  color: var(--dsw-alias-label-tertiary); }
.minimalui-todo-close:hover,
.minimalui-todo-close:focus-visible { background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary); }
.minimalui-todo-close:focus-visible { outline: 1.5px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.minimalui-todo-close svg { width: 14px; height: 14px; }
.minimalui-todo-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--dsw-alias-label-tertiary); }
.minimalui-todo-dot[data-status="completed"] { background: var(--dsw-alias-state-success-primary); }
.minimalui-todo-dot[data-status="in_progress"] { background: var(--dsw-alias-state-business-primary); }
/* Edited-files card: header only by default, its own chevron reveals the rows. */
[data-changed-files] { position: relative; }
[data-changed-files] > .HOHHba_toggle { display: none; }
[data-changed-files][data-minimal-ui-fold="closed"] > .HOHHba_list { display: none; }
.minimalui-changes-toggle { position: absolute; top: 18px; right: 6px; width: 24px; height: 24px;
  display: grid; place-items: center; padding: 0; border: 0; border-radius: var(--dsw-radius-sm);
  background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; opacity: .7; }
.minimalui-changes-toggle:hover,
.minimalui-changes-toggle:focus-visible { opacity: 1; background: var(--changes-hover, var(--dsw-alias-interactive-bg-hover)); }
.minimalui-changes-toggle:focus-visible { outline: 1.5px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.minimalui-changes-toggle svg { width: 14px; height: 14px; transition: transform 150ms ease; }
[data-changed-files][data-minimal-ui-fold="open"] .minimalui-changes-toggle svg { transform: rotate(180deg); }
/* Turn rail: parked just off the right edge until the pointer comes looking for it. */
.SNx2jG_frame {
  opacity: 0; transform: translateY(-50%) translateX(10px);
  transition: opacity 160ms ease, transform 160ms ease;
}
/* A wider invisible grab strip summons the rail without pixel-hunting.
   ::before paints under the marks, so the marks keep their own hit area. */
.SNx2jG_frame::before {
  content: ""; position: absolute; inset: -10px -10px -10px -26px;
}
.SNx2jG_frame:hover,
.SNx2jG_frame:focus-within {
  opacity: 1; transform: translateY(-50%);
}
/* Session header: the four status cells are metadata, not navigation.
   Flatten them to one quiet tertiary line so the title keeps the eye. */
.an3WzG_headerActions { gap: 6px; margin-left: 12px; }
.an3WzG_headerActions > *,
.an3WzG_headerActions > * * {
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-tertiary);
  font-variant-numeric: tabular-nums;
}
.an3WzG_headerActions > * {
  opacity: .72;
  transition: opacity 120ms ease;
}
.an3WzG_headerActions > *:hover,
.an3WzG_headerActions > *:focus-within { opacity: 1; }
/* Icon-first: word cells (agent team, agent preset) keep only the glyph, and the
   count cells keep only the number. Nothing changes size on hover: a growing cell
   would push its neighbours out from under the pointer and make the row flicker. */
.an3WzG_headerActions > *:first-child,
.an3WzG_headerActions > *:first-child *,
.dscfja_label { font-size: 0; }
.rezYhW_count,
.Ag-ohG_count {
  display: inline-block; max-width: 2.2ch; overflow: hidden;
  white-space: nowrap; vertical-align: bottom;
}
.an3WzG_tabs { margin-top: 6px; }
/* Session header row is intentionally left at the host default. The host's static
   overflow menu (aria-label 更多操作) only contains fixed session items
   (复制会话为 Markdown / 下载 Session 日志 / 反馈); it does NOT absorb the other header
   cell buttons (agent team, agent preset, jobs, open-in-app, forge, bottom panel,
   context diagnostics). So hiding those cells via CSS makes their actions unreachable,
   with no overflow fallback. Their hashed class names change between releases, which is
   why this note names them by role instead. Do not re-add a blanket display:none block
   here. See 20-Projects/电脑维护.md 2026-11-08. */
/* Sidebar foot: one round icon button for the host palette. The glyph is the
   affordance, not the state: a sun means "go light", a moon means "go dark", so the
   icon names what the click will do next. */
.minimalui-theme-toggle {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--dsw-radius-sm);
  background: none;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  transition: background-color .12s ease, color .12s ease;
}
/* The foot stacks the action row above the account row. Seated: this button leaves the
   flow, the action row collapses to zero height, and the icon rides the account row's
   right end, clear of the account label. The top offset is measured at runtime. */
.minimalui-theme-toggle-overlay {
  position: absolute;
  right: 8px;
  top: 11px;
  z-index: 2;
}
/* Fallback when the account row is not measurable (rail state, print, no layout):
   stay in the action row instead of floating over something else. */
.minimalui-theme-toggle-inline { margin-left: auto; }
.minimalui-theme-toggle:hover {
  background: var(--dsw-alias-interactive-bg-hover-solid);
  color: var(--dsw-alias-label-primary);
}
.minimalui-theme-toggle:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 1.5px var(--dsw-alias-brand-primary);
}
.minimalui-theme-toggle svg { width: 16px; height: 16px; display: block; }
@media (prefers-reduced-motion: reduce) {
  .an3WzG_headerActions > * { transition: none; }
  [data-actions-reveal] ._1KfHza_actions,
  [data-composer-stat] { transition: none; }
  .minimalui-changes-toggle svg { transition: none; }
  .SNx2jG_frame { transition: none; }
}
/* Settings dialog drag: the shipped panel is a fixed, flex-centred box with no move
   handler, so the plugin adds a window-style move. The top strip (title + header row)
   is the grab handle; position lives in custom properties so React never owns the
   value and a re-render cannot reset it. Narrow full-screen mode has nowhere to drag
   to, so the listener skips it. */
[data-shortcut-modal="settings"] {
  transform: translate3d(var(--minimalui-settings-x, 0px), var(--minimalui-settings-y, 0px), 0);
}
[data-shortcut-modal="settings"].minimalui-settings-dragging {
  transition: none !important;
  will-change: transform;
}
[data-shortcut-modal="settings"] > [class*="_navTitle"],
[data-shortcut-modal="settings"] > [class*="_header"] {
  cursor: grab;
}
[data-shortcut-modal="settings"].minimalui-settings-dragging > [class*="_navTitle"],
[data-shortcut-modal="settings"].minimalui-settings-dragging > [class*="_header"] {
  cursor: grabbing;
}
[data-shortcut-modal="settings"] > [class*="_header"] button { cursor: pointer; }
`;
    const statsNamespace = 'local-minimal-ui-stats';
    const dictionaries = {
      // Host locale ids are exactly "zh" and "en"; a "zh-CN" key would fall back to English.
      zh: {
        speed: '生成速度', cache: '缓存命中', context: '上下文', noData: '暂无数据',
        group: '会话状态', rate: 'Token/秒', decode: '生成 Token',
        decodeTime: '生成耗时', llmTime: '模型耗时', toolTime: '工具耗时',
        ttft: '平均首 Token 等待', turns: '对话轮数', steps: '模型调用次数',
        input: '输入 Token', output: '输出 Token', read: '缓存读取', write: '缓存写入',
        uncached: '未缓存输入', used: '已用 / 窗口', system: '系统提示', tools: '工具定义',
        messages: '消息', estimated: '上下文用量为估算值。',
        cacheNote: '命中率 = 缓存读取 ÷ 输入总量。', seconds: '秒',
        todoTitle: '任务', todoDone: '已完成', todoActive: '进行中', todoPending: '待处理',
        todoClose: '关闭任务面板', todoStatusCompleted: '已完成',
        todoStatusInProgress: '进行中', todoStatusPending: '待处理',
        editLabel: '编辑这条输入',
        foldOpen: '展开文件列表', foldClose: '收起文件列表',
        themeToLight: '切换到亮色', themeToDark: '切换到暗色',
      },
      en: {
        speed: 'Generation speed', cache: 'Cache hit rate', context: 'Context', noData: 'No data yet',
        group: 'Session status', rate: 'tokens/s', decode: 'Generated tokens',
        decodeTime: 'Generation time', llmTime: 'Model time', toolTime: 'Tool time',
        ttft: 'Average time to first token', turns: 'Turns', steps: 'Model calls',
        input: 'Input tokens', output: 'Output tokens', read: 'Cache read', write: 'Cache write',
        uncached: 'Uncached input', used: 'Used / window', system: 'System prompt', tools: 'Tool definitions',
        messages: 'Messages', estimated: 'Context usage is estimated.',
        cacheNote: 'Hit rate = cache reads / total input.', seconds: 's',
        todoTitle: 'Tasks', todoDone: 'done', todoActive: 'active', todoPending: 'pending',
        todoClose: 'Dismiss task panel', todoStatusCompleted: 'Completed',
        todoStatusInProgress: 'In progress', todoStatusPending: 'Pending',
        editLabel: 'Edit this message',
        foldOpen: 'Show changed files', foldClose: 'Hide changed files',
        themeToLight: 'Switch to light', themeToDark: 'Switch to dark',
      },
    };
    // Same disjoint billing buckets and projected context estimate as the native pills.
    function metricReadings(stats, usage, pressure) {
      const valid = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
      const speed = valid(stats?.decodeTokens) && valid(stats?.decodeMs) && stats.decodeMs > 0
        ? stats.decodeTokens * 1000 / stats.decodeMs : null;
      const buckets = usage && [usage.uncachedInputTokens, usage.cacheReadTokens, usage.cacheWriteTokens];
      const input = buckets && buckets.every(valid) ? buckets.reduce((a, b) => a + b, 0) : null;
      let cache = null;
      if (input > 0) {
        const ratio = Math.min(1, usage.cacheReadTokens / input);
        cache = '100%';
        if (ratio < 1) {
          cache = '<100%';
          for (let digits = 0; digits <= 6; digits++) {
            const text = (ratio * 100).toFixed(digits);
            if (Number(text) < 100) { cache = text + '%'; break; }
          }
        }
      }
      const used = pressure?.projectedTokens ?? pressure?.pressureTokens;
      const windowSize = pressure?.contextWindow;
      const context = valid(used) && valid(windowSize) && windowSize > 0
        ? Math.min(100, used / windowSize * 100) : null;
      return { speed, cache, input, used, windowSize, context };
    }
    function StatIcon({ kind, percent }) {
      const h = React.createElement;
      const shapes = kind === 'speed'
        ? [h('path', { key: 'gauge', d: 'M3 16a9 9 0 1 1 18 0M5 16h2m10 0h2M12 5v2M6 8l1.5 1.5M18 8l-1.5 1.5' }),
          h('path', { key: 'needle', d: 'm12 14 3-4' }), h('circle', { key: 'hub', cx: 12, cy: 14, r: 1 })]
        : kind === 'cache'
          ? [h('ellipse', { key: 'top', cx: 12, cy: 5, rx: 8, ry: 3 }),
            h('path', { key: 'body', d: 'M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7' })]
          : [h('circle', { key: 'track', cx: 12, cy: 12, r: 8, opacity: .25 }),
            h('circle', { key: 'fill', cx: 12, cy: 12, r: 8, pathLength: 100,
              strokeDasharray: `${percent == null ? 0 : percent} 100`, transform: 'rotate(-90 12 12)' })];
      return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, shapes);
    }
    function StatsToolbar({ useProjection, t, sessionId }) {
      const h = React.createElement;
      const stats = useProjection('sessionStats');
      const usage = useProjection('tokenUsage');
      const pressure = useProjection('contextPressure');
      const breakdown = useProjection('contextBreakdown');
      const values = metricReadings(stats, usage, pressure);
      const [hover, setHover] = React.useState(null);
      const [focused, setFocused] = React.useState(null);
      const [open, setOpen] = React.useState(null);
      const [position, setPosition] = React.useState({ visibility: 'hidden' });
      const root = React.useRef(null);
      const panel = React.useRef(null);
      const buttons = React.useRef([]);
      const hoverTimer = React.useRef(null);
      const cancelHoverClose = React.useCallback(() => { clearTimeout(hoverTimer.current); }, []);
      const leaveHover = () => {
        cancelHoverClose();
        hoverTimer.current = setTimeout(() => setHover(null), 180);
      };
      React.useEffect(() => () => cancelHoverClose(), [cancelHoverClose]);
      const popupId = React.useId();
      const active = open ?? hover ?? focused;
      const pinned = open !== null;
      const number = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0
        ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(v) : null;
      const duration = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0
        ? `${(v / 1000).toFixed(1)} ${t('seconds')}` : null;
      const readings = [values.speed === null ? t('noData') : `${values.speed.toFixed(1)} ${t('rate')}`,
        values.cache ?? t('noData'), values.context === null ? t('noData') : `${Math.round(values.context)}%`];
      const kinds = ['speed', 'cache', 'context'];
      const rows = [
        [['decode', number(stats?.decodeTokens)], ['decodeTime', duration(stats?.decodeMs)],
          ['ttft', stats?.ttftSteps > 0 ? duration(stats.ttftMs / stats.ttftSteps) : null],
          ['llmTime', duration(stats?.llmMs)], ['toolTime', duration(stats?.toolMs)],
          ['turns', number(stats?.turns)], ['steps', number(stats?.steps)]],
        [['input', number(values.input)], ['read', number(usage?.cacheReadTokens)],
          ['write', number(usage?.cacheWriteTokens)], ['uncached', number(usage?.uncachedInputTokens)],
          ['output', number(usage?.outputTokens)]],
        [['used', values.context === null ? null : `~${number(values.used)} / ${number(values.windowSize)}`],
          ['system', number(breakdown?.systemTokens)], ['tools', number(breakdown?.toolsTokens)],
          ['messages', number(breakdown?.messageTokens)]],
      ];
      const dismiss = React.useCallback((restore = false) => {
        cancelHoverClose();
        if (restore && open !== null) buttons.current[open]?.focus({ preventScroll: true });
        setOpen(null);
        setHover(null);
        setFocused(null);
      }, [open, cancelHoverClose]);
      React.useEffect(() => {
        cancelHoverClose(); setOpen(null); setHover(null); setFocused(null);
      }, [sessionId, cancelHoverClose]);
      React.useEffect(() => {
        if (active === null) return;
        const outside = (event) => { if (!root.current?.contains(event.target)) dismiss(); };
        const escape = (event) => {
          if (event.key === 'Escape') { event.preventDefault(); dismiss(pinned); }
        };
        document.addEventListener('pointerdown', outside, true);
        document.addEventListener('keydown', escape);
        return () => {
          document.removeEventListener('pointerdown', outside, true);
          document.removeEventListener('keydown', escape);
        };
      }, [active, pinned, dismiss]);
      React.useLayoutEffect(() => {
        if (active === null || !panel.current) return;
        const node = panel.current;
        // An owned HTML popover escapes composer overflow without reparenting any DOM.
        if (typeof node.showPopover === 'function') node.showPopover();
        else node.style.display = 'block';
        const place = () => {
          const anchor = buttons.current[active]?.getBoundingClientRect();
          if (!anchor) return;
          const box = node.getBoundingClientRect();
          const left = Math.max(12, Math.min(anchor.left, window.innerWidth - box.width - 12));
          const top = Math.max(12, anchor.top - box.height - 8);
          setPosition((previous) => previous.left === left && previous.top === top
            ? previous : { left, top, visibility: 'visible' });
        };
        place();
        const observer = new ResizeObserver(place);
        observer.observe(node);
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        if (pinned) node.focus({ preventScroll: true });
        return () => {
          observer.disconnect();
          window.removeEventListener('resize', place);
          window.removeEventListener('scroll', place, true);
          if (typeof node.hidePopover === 'function' && node.matches(':popover-open')) node.hidePopover();
        };
      }, [active, pinned]);
      const detailRows = active === null ? [] : rows[active].filter(([, value]) => value !== null);
      return h('span', { ref: root, className: 'minimalui-stats', role: 'group', 'aria-label': t('group') },
        kinds.map((kind, index) => h('button', {
          key: kind, ref: (node) => { buttons.current[index] = node; }, type: 'button',
          className: 'minimalui-stat', 'data-warning': index === 2 && values.context >= 85 ? '' : undefined,
          'aria-label': `${t(kind)}: ${readings[index]}`, 'aria-haspopup': 'dialog',
          'aria-expanded': open === index, 'aria-controls': active === index ? popupId : undefined,
          'aria-describedby': !pinned && active === index ? popupId : undefined,
          onPointerEnter: (event) => {
            if (event.pointerType === 'mouse') { cancelHoverClose(); setHover(index); }
          },
          onPointerLeave: leaveHover, onFocus: () => setFocused(index),
          onBlur: () => setFocused(null),
          onClick: () => {
            cancelHoverClose(); setHover(null); setFocused(null);
            setOpen((previous) => previous === index ? null : index);
          },
        }, h(StatIcon, { kind, percent: values.context }))),
        active === null ? null : h('div', {
          key: `${active}-${pinned}`, ref: panel, id: popupId, className: 'minimalui-popup',
          popover: 'manual', style: position, role: pinned ? 'dialog' : 'tooltip',
          onPointerEnter: (event) => {
            if (event.pointerType === 'mouse') { cancelHoverClose(); setHover(active); }
          }, onPointerLeave: leaveHover,
          tabIndex: pinned ? -1 : undefined, 'aria-label': pinned ? t(kinds[active]) : undefined,
        }, pinned ? [
          h('h3', { key: 'title' }, `${t(kinds[active])} · ${readings[active]}`),
          detailRows.length ? h('dl', { key: 'rows' }, detailRows.flatMap(([key, value]) => [
            h('dt', { key: `${key}-label` }, t(key)), h('dd', { key }, value),
          ])) : h('p', { key: 'empty' }, t('noData')),
          active === 1 && values.input > 0 ? h('p', { key: 'note' }, t('cacheNote')) : null,
          active === 2 && values.context !== null ? h('p', { key: 'note' }, t('estimated')) : null,
        ] : `${t(kinds[active])} · ${readings[active]}`));
    }
    // Reuses the host panel classes so the look is unchanged, and adds a real dismiss.
    function TodoPanelWithDismiss({ useProjection, t }) {
      const h = React.createElement;
      const todos = useProjection('todos') ?? [];
      const [collapsed, setCollapsed] = React.useState(true);
      const [dismissed, setDismissed] = React.useState(null);
      // Identity is the task text: progress updates keep it closed, a new list reopens it.
      const signature = todos.map((item) => item.content).join('\n');
      if (todos.length === 0) return null;
      // Keep ownership while dismissed, so the host panel does not reappear until
      // a new task list arrives. If this component is absent, no marker is mounted.
      if (dismissed !== null && dismissed === signature) {
        return h('span', { 'data-minimalui-todo-owner': '', hidden: true });
      }
      const done = todos.filter((item) => item.status === 'completed').length;
      const active = todos.filter((item) => item.status === 'in_progress').length;
      const pending = todos.length - done - active;
      const progress = [
        ...(done > 0 ? [`${done} ${t('todoDone')}`] : []),
        ...(active > 0 ? [`${active} ${t('todoActive')}`] : []),
        ...(pending > 0 ? [`${pending} ${t('todoPending')}`] : []),
      ].join(' · ');
      const statusLabel = (status) => status === 'completed' ? t('todoStatusCompleted')
        : status === 'in_progress' ? t('todoStatusInProgress') : t('todoStatusPending');
      const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
        strokeLinecap: 'round', strokeLinejoin: 'round' };
      return h('section', {
        className: 'DXuOLW_root minimalui-todo-root', 'data-testid': 'todo-panel',
        'data-minimalui-todo-owner': '', 'aria-label': t('todoTitle'),
      }, h('div', { className: 'DXuOLW_body' },
        h('div', { className: 'minimalui-todo-row' },
          h('button', {
            type: 'button', className: 'DXuOLW_header', 'aria-expanded': !collapsed,
            onClick: () => setCollapsed((value) => !value),
          },
            h('span', { className: 'DXuOLW_lead', 'aria-hidden': true },
              h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, ...stroke },
                h('path', { d: 'M2.5 4.5h11M2.5 8h11M2.5 11.5h11' }),
                h('path', { d: 'M4 4.5l.9.9L6.6 3.7M4 8l.9.9 1.7-1.7M4 11.5l.9.9 1.7-1.7' }))),
            h('span', { className: 'DXuOLW_title' }, t('todoTitle')),
            h('span', { className: 'DXuOLW_progress' }, progress),
            h('span', { className: 'DXuOLW_chevron', 'aria-hidden': true },
              h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, ...stroke },
                h('path', { d: collapsed ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4' })))),
          h('button', {
            type: 'button', className: 'minimalui-todo-close', 'aria-label': t('todoClose'),
            onClick: () => setDismissed(signature),
          }, h('svg', { viewBox: '0 0 16 16', ...stroke }, h('path', { d: 'M4 4l8 8M12 4l-8 8' })))),
        !collapsed && h('ul', { className: 'DXuOLW_list' }, todos.map((item) => h('li', {
          key: item.content, className: 'DXuOLW_item', 'data-status': item.status,
        },
          h('span', { className: 'DXuOLW_glyph', role: 'img', 'aria-label': statusLabel(item.status) },
            h('span', { className: 'minimalui-todo-dot', 'data-status': item.status })),
          h('span', { className: 'DXuOLW_content' }, item.content))))));
    }
    // The host has no slot inside a user message's action row, so the affordance is
    // injected beside the copy button of the last message, and only when that turn
    // ended without a reply or stopped early. The shipped class supplies the styling.
    function EditAffordance({ useChat, inputActions, t }) {
      const chat = useChat((state) => state);
      const turns = chat?.timeline?.turns;
      const list = turns && typeof turns.values === 'function' ? [...turns.values()] : [];
      const seq = (turn) => turn?.end?.seq ?? turn?.start?.seq ?? -1;
      const last = list.length === 0 ? null : list.reduce((a, b) => (seq(b) >= seq(a) ? b : a));
      const reason = last?.end?.data?.reason?.kind;
      // A Turn without an end and still open is generating; a stopped or failed Turn keeps its end.
      const live = list.some((turn) => turn && turn.status === 'open' && !turn.end);
      const offer = !live && (reason === 'aborted' || reason === 'interrupted'
        || reason === 'error');
      const latest = React.useRef({ offer, inputActions, t });
      latest.current = { offer, inputActions, t };
      const resync = React.useRef(null);
      React.useEffect(() => {
        let pending = 0;
        let mounted = null;
        const text = (row) => [...row.children]
          .filter((node) => !node.classList.contains('_1KfHza_actions'))
          .map((node) => node.innerText).join('').trim();
        function remove() {
          if (!mounted) return;
          mounted.button.remove();
          mounted = null;
        }
        function build(row) {
          const label = latest.current.t('editLabel');
          const button = document.createElement('button');
          button.type = 'button';
          button.className = '_1KfHza_action minimalui-edit';
          button.dataset.minimalUiEdit = '';
          button.title = label;
          button.setAttribute('aria-label', label);
          button.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none"'
            + ' stroke="currentColor" stroke-width="1.6" stroke-linecap="round"'
            + ' stroke-linejoin="round" aria-hidden="true">'
            + '<path d="M11.1 2.9l2 2-7.3 7.3-2.7.7.7-2.7 7.3-7.3z"/></svg>';
          button.addEventListener('click', () => {
            const value = text(row);
            if (!value) return;
            latest.current.inputActions?.setDraft?.(value);
            requestAnimationFrame(() => document.querySelector('.GRgSLq_input')?.focus());
          });
          return button;
        }
        // A prompt with nothing but later user/steering rows after it has no reply yet.
        function unreplied(row) {
          const item = row.closest('[data-chat-flow-kind]');
          if (!item?.parentElement) return false;
          for (let node = item.nextElementSibling; node; node = node.nextElementSibling) {
            const kind = node.getAttribute('data-chat-flow-kind');
            if (kind !== null && kind !== 'user' && kind !== 'steering') return false;
          }
          return true;
        }
        function sync() {
          pending = 0;
          const rows = document.querySelectorAll('.LOmM4q_userRow');
          const row = rows.length === 0 ? null : rows[rows.length - 1];
          const actions = row?.querySelector(':scope > ._1KfHza_actions');
          if (!actions || !(latest.current.offer || unreplied(row))) { remove(); return; }
          if (mounted && mounted.row === row && mounted.button.isConnected) return;
          remove();
          const button = build(row);
          actions.append(button);
          mounted = { row, button };
        }
        function schedule() {
          if (!pending) pending = requestAnimationFrame(sync);
        }
        const observer = new MutationObserver((records) => {
          if (records.some((record) => [...record.addedNodes, ...record.removedNodes]
            .some((node) => node.nodeType === 1))) schedule();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        resync.current = sync;
        sync();
        return () => {
          observer.disconnect();
          if (pending) cancelAnimationFrame(pending);
          resync.current = null;
          remove();
        };
      }, []);
      // The observer only watches markup; offer and language changes re-run it here.
      React.useEffect(() => { resync.current?.(); }, [offer, t]);
      return null;
    }
    // The shipped edited-files card only folds beyond four rows. This starts as the
    // header alone and reuses the host's own expand state so every row can be reached.
    function ChangesFold({ t }) {
      const latest = React.useRef({ t });
      latest.current = { t };
      const resync = React.useRef(null);
      React.useEffect(() => {
        let pending = 0;
        function label(open) { return latest.current.t(open ? 'foldClose' : 'foldOpen'); }
        function build(card) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'minimalui-changes-toggle';
          button.dataset.minimalUiFold = '';
          button.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor"'
            + ' stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'
            + ' aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
          button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            apply(card, card.dataset.minimalUiFold !== 'open');
          });
          return button;
        }
        function apply(card, open) {
          card.dataset.minimalUiFold = open ? 'open' : 'closed';
          const button = card.querySelector(':scope > .minimalui-changes-toggle');
          if (button) {
            const text = label(open);
            button.setAttribute('aria-expanded', String(open));
            button.setAttribute('aria-label', text);
            button.title = text;
          }
          // Rows past the fold only exist after the host's own toggle opens.
          const toggle = card.querySelector(':scope > .HOHHba_toggle');
          if (toggle && (toggle.getAttribute('aria-expanded') === 'true') !== open) toggle.click();
        }
        function sync() {
          pending = 0;
          for (const card of document.querySelectorAll('[data-changed-files]')) {
            // A single-file card has no rows to fold.
            if (!card.querySelector(':scope > .HOHHba_list')) continue;
            if (!card.querySelector(':scope > .minimalui-changes-toggle')) card.append(build(card));
            apply(card, card.dataset.minimalUiFold === 'open');
          }
        }
        function schedule() {
          if (!pending) pending = requestAnimationFrame(sync);
        }
        const observer = new MutationObserver((records) => {
          if (records.some((record) => [...record.addedNodes, ...record.removedNodes]
            .some((node) => node.nodeType === 1))) schedule();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        resync.current = sync;
        sync();
        return () => {
          observer.disconnect();
          if (pending) cancelAnimationFrame(pending);
          resync.current = null;
          for (const button of document.querySelectorAll('.minimalui-changes-toggle')) button.remove();
        };
      }, []);
      React.useEffect(() => { resync.current?.(); }, [t]);
      return null;
    }
    // The header status cells are iconified by CSS, so their words are kept as the
    // native title: the browser draws it at the cursor, so it cannot be misplaced,
    // and the row keeps its exact layout instead of reflowing under the pointer.
    function HeaderCellTitles() {
      React.useEffect(() => {
        let host = null;
        let pending = 0;
        const hostObserver = new MutationObserver(schedule);
        function sync() {
          pending = 0;
          if (!host || !host.isConnected) return;
          for (const cell of host.children) {
            const text = (cell.textContent || '').replace(/\s+/g, ' ').trim();
            if (!text || cell.getAttribute('title') === text) continue;
            cell.setAttribute('title', text);
          }
        }
        function schedule() {
          if (!pending) pending = requestAnimationFrame(sync);
        }
        // The header is rebuilt per session, so re-attach whenever it is replaced.
        const bodyObserver = new MutationObserver((records) => {
          if (!records.some((record) => [...record.addedNodes, ...record.removedNodes]
            .some((node) => node.nodeType === 1))) return;
          const next = document.querySelector('.an3WzG_headerActions');
          if (next !== host) {
            hostObserver.disconnect();
            host = next;
            if (host) hostObserver.observe(host, {
              childList: true, subtree: true, characterData: true,
            });
          }
          schedule();
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
        return () => {
          bodyObserver.disconnect();
          hostObserver.disconnect();
          if (pending) cancelAnimationFrame(pending);
          for (const cell of document.querySelectorAll('.an3WzG_headerActions > *')) {
            cell.removeAttribute('title');
          }
        };
      }, []);
      return null;
    }
    // True once the dock cell installed the controller-backed listener; the shell-level
    // watchdog below only arms its Escape fallback while this is still false.
    let commandMenuToggleInstalled = false;
    // Capture on the document: the dock cell renders in the composer stack, a SIBLING
    // of .GRgSLq_root, so a root-scoped listener never installs. Capture runs before the
    // host's card mousedown focuses/retracks the editor, which is what reopens the menu.
    function installCommandMenuToggle(doc, controller) {
      let closingButton = null;
      const findButton = (event) => {
        const button = event.target?.closest?.('.GRgSLq_add[aria-haspopup="listbox"]');
        return button && !button.disabled ? button : null;
      };
      const isOpen = () => Boolean(controller?.menu?.getSnapshot?.().open);
      const consume = (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      };
      const onPointerDown = (event) => {
        if (!controller && commandMenuToggleInstalled) return;
        closingButton = null;
        if (event.button !== 0 || event.defaultPrevented) return;
        const button = findButton(event);
        if (!button) return;
        if (controller) {
          if (!isOpen()) return;
          closingButton = button;
          consume(event);
          controller.dismiss();
          return;
        }
        // Without the host controller, fall back to the editor's own Escape route.
        const editor = button.closest('[data-composer-card]')?.querySelector('[contenteditable="true"]');
        const menu = button.closest('[data-composer-card]')?.querySelector('[data-trigger-menu]');
        if (!editor || !menu) return;
        closingButton = button;
        consume(event);
        editor.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Escape', code: 'Escape', bubbles: true, cancelable: true,
        }));
      };
      const onMouseDown = (event) => {
        if (closingButton && findButton(event) === closingButton) consume(event);
      };
      const onClick = (event) => {
        if (event.button !== 0) return;
        const button = findButton(event);
        const closing = button && button === closingButton;
        closingButton = null;
        if (!button || event.defaultPrevented) return;
        if (closing) {
          consume(event);
        } else if (isOpen()) {
          // Keyboard activation has no preceding pointerdown.
          consume(event);
          controller.dismiss();
        }
      };
      doc.addEventListener('pointerdown', onPointerDown, true);
      doc.addEventListener('mousedown', onMouseDown, true);
      doc.addEventListener('click', onClick, true);
      return () => {
        doc.removeEventListener('pointerdown', onPointerDown, true);
        doc.removeEventListener('mousedown', onMouseDown, true);
        doc.removeEventListener('click', onClick, true);
      };
    }
    // Renders nothing: it only owns the document listener for the open menu's button.
    function CommandMenuToggle({ controller }) {
      React.useEffect(() => {
        const dispose = installCommandMenuToggle(document, controller ?? null);
        commandMenuToggleInstalled = controller !== null && controller !== undefined;
        return () => {
          commandMenuToggleInstalled = false;
          dispose();
        };
      }, [controller]);
      return null;
    }
    // The host owns the theme: ctx.theme holds the preference and every change emits
    // theme/change. Mirror the RESOLVED scheme (so "system" follows the OS and the icon
    // still matches what the user sees) and write back an explicit preference.
    let resolvedScheme = 'light';
    const schemeWatchers = new Set();
    function useResolvedScheme() {
      const [scheme, setScheme] = React.useState(resolvedScheme);
      React.useEffect(() => {
        const watcher = (next) => setScheme(next);
        schemeWatchers.add(watcher);
        watcher(resolvedScheme);
        return () => { schemeWatchers.delete(watcher); };
      }, []);
      return scheme;
    }
    // The host ships the exact light/dark glyphs the Appearance row uses in its
    // primitives bundle. Borrow them so the sidebar button is pixel-identical to the
    // settings surface instead of a lookalike; the hand-drawn pair stays as fallback
    // for a host that stops exporting that module.
    // Resolved lazily: a require or element build at module scope runs while the client
    // boot is still wiring the module table, and anything slow there keeps this entry in
    // 'loading', which the boot supervisor treats as a failed start.
    let hostIcons = false;
    function ensureHostIcons() {
      if (hostIcons !== false) return hostIcons;
      try {
        hostIcons = require('@deepseek-ai/dsh-client-ui-primitives') || null;
      } catch (error) {
        hostIcons = null;
      }
      return hostIcons;
    }
    const themeIconProps = {
      viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor',
      strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
    };
    let drawnGlyphsCache = null;
    function drawnGlyphs() {
      if (drawnGlyphsCache !== null) return drawnGlyphsCache;
      drawnGlyphsCache = {
        sun: React.createElement('svg', themeIconProps, [
          React.createElement('circle', { key: 'disc', cx: 12, cy: 12, r: 4 }),
          React.createElement('path', {
            key: 'rays',
            d: 'M12 2.4v2.2M12 19.4v2.2M4.5 4.5 6 6M18 18l1.5 1.5M2.4 12h2.2M19.4 12h2.2M4.5 19.5 6 18M18 6l1.5-1.5',
          }),
        ]),
        moon: React.createElement('svg', themeIconProps, [
          React.createElement('path', { key: 'crescent', d: 'M20.4 14.3A8.6 8.6 0 1 1 9.7 3.6a6.9 6.9 0 0 0 10.7 10.7Z' }),
        ]),
      };
      return drawnGlyphsCache;
    }
    let cachedSun = null;
    let cachedMoon = null;
    function themeGlyphs() {
      if (cachedSun !== null && cachedMoon !== null) return { sun: cachedSun, moon: cachedMoon };
      const icons = ensureHostIcons();
      const pick = (name, fallback) => {
        const Icon = icons ? icons[name] : null;
        return typeof Icon === 'function' ? React.createElement(Icon, { size: 16 }) : fallback;
      };
      const drawn = drawnGlyphs();
      cachedSun = pick('IconLightOutlineMedium', drawn.sun);
      cachedMoon = pick('IconDarkOutlineMedium', drawn.moon);
      return { sun: cachedSun, moon: cachedMoon };
    }
    // The sidebar foot stacks the action row (this cell) above the account row, and the
    // slot renderer may wrap the cell, so the seat walks up to the first ancestor whose
    // next sibling actually holds the account trigger. The offset is then measured
    // against the button's own offset parent, which is the box `top` resolves in.
    const boxOf = (element) => {
      if (!element || typeof element.getBoundingClientRect !== 'function') return null;
      const rect = element.getBoundingClientRect();
      return rect && rect.width > 0 ? rect : null;
    };
    function findAccountRow(button) {
      let node = button;
      for (let depth = 0; node && depth < 8; depth += 1) {
        const row = node.parentElement;
        if (!row) return null;
        const sibling = row.nextElementSibling;
        if (sibling && typeof sibling.querySelectorAll === 'function') {
          const candidates = sibling.querySelectorAll('button, [role="button"]');
          for (let index = 0; index < candidates.length; index += 1) {
            const rect = boxOf(candidates[index]);
            if (rect && rect.height > 30 && rect.width > 60) return { row, trigger: rect };
          }
        }
        const first = sibling ? boxOf(sibling.firstElementChild) : null;
        // The rail state renders a 36px account glyph, not a labelled row: keep the
        // inline fallback rather than parking the button over a collapsed row.
        if (first && first.height > 30 && first.width > 60) return { row, trigger: first };
        node = row;
      }
      return null;
    }
    function seatOffset(trigger, baseTop, height) {
      const buttonHeight = height || 28;
      return Math.round(trigger.top + trigger.height / 2 - baseTop - buttonHeight / 2);
    }
    function useAccountRowSeat(buttonRef) {
      const [seated, setSeated] = React.useState(false);
      React.useEffect(() => {
        const button = buttonRef.current;
        const initial = button ? findAccountRow(button) : null;
        if (!button || !initial || typeof window === 'undefined') return;
        const row = initial.row;
        const previousPosition = row.style.position;
        const frames = [];
        const unseat = () => {
          row.style.position = previousPosition;
          button.style.position = '';
          button.style.top = '';
          button.style.right = '';
          setSeated(false);
        };
        const place = () => {
          // Take the button out of flow first: the action row only collapses to 0 high
          // once the icon is absolute, and the account row moves up by that amount, so
          // measuring before this step is always one button-height off.
          row.style.position = 'relative';
          button.style.position = 'absolute';
          const match = findAccountRow(button);
          const parent = button.offsetParent;
          const base = parent ? boxOf(parent) : null;
          if (!match || !base) {
            unseat();
            return;
          }
          button.style.top = `${seatOffset(match.trigger, base.top, button.offsetHeight)}px`;
          // The trigger fills the row until the connection/update indicators appear at
          // its right end; keep the icon just inside the trigger while it is alone and
          // shift it left of those indicators when they are mounted.
          const trailing = Math.round(base.right - match.trigger.right);
          button.style.right = `${trailing > 4 ? trailing + 6 : 8}px`;
          setSeated(true);
        };
        place();
        // The collapse itself changes the account row position, so settle over a couple
        // of frames before trusting the measurement.
        if (typeof requestAnimationFrame === 'function') {
          frames.push(requestAnimationFrame(() => {
            place();
            if (typeof requestAnimationFrame === 'function') frames.push(requestAnimationFrame(place));
          }));
        }
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null;
        if (observer) {
          observer.observe(row);
          if (row.nextElementSibling) observer.observe(row.nextElementSibling);
          if (row.parentElement) observer.observe(row.parentElement);
        }
        window.addEventListener('resize', place);
        return () => {
          for (const frame of frames) {
            if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
          }
          if (observer) observer.disconnect();
          window.removeEventListener('resize', place);
          row.style.position = previousPosition;
          button.style.position = '';
          button.style.top = '';
          button.style.right = '';
        };
      }, [buttonRef]);
      return seated;
    }
    // One glyph only: sun while dark (click goes light), moon while light (click goes dark).
    function ThemeToggle({ t, setTheme }) {
      try { globalThis.__minimalUiMark?.('render:ThemeToggle'); } catch (error) {}
      const dark = useResolvedScheme() === 'dark';
      const label = typeof t === 'function' ? t(dark ? 'themeToLight' : 'themeToDark') : '';
      const ref = React.useRef(null);
      const seated = useAccountRowSeat(ref);
      return React.createElement('button', {
        type: 'button',
        ref,
        className: seated
          ? 'minimalui-theme-toggle minimalui-theme-toggle-overlay'
          : 'minimalui-theme-toggle minimalui-theme-toggle-inline',
        'aria-label': label || undefined,
        title: label || undefined,
        onClick: () => setTheme(dark ? 'light' : 'dark'),
      }, dark ? themeGlyphs().sun : themeGlyphs().moon);
    }
    // Guide fold: the shipped guide draws one card per page kind, and every plugin outside the
    // shipped @deepseek-ai set adds a door of its own, so the column fills with tools a given
    // user may never open. Their pages stay registered; only the always-on card goes away, and
    // the same rows reappear at the top of the More tools menu, one click from the same place.
    const foldedKinds = new Set();
    let foldedStyle = null;
    function refreshFoldedKinds(registry) {
      // A folded card must have a working menu row. Keep all original cards visible
      // when the host no longer exposes the menu component used by this plugin.
      const menuItem = ensureHostIcons()?.MenuItemButton;
      const entries = typeof menuItem === 'function' && typeof registry?.guide === 'function'
        ? registry.guide() : [];
      const kinds = new Set();
      for (const entry of entries) {
        const provider = String(entry?.providerId ?? '');
        const kind = String(entry?.kind ?? '').trim();
        // The shipped guide always keeps the files card and drops it from the More menu rows,
        // so folding it would erase it: better-sidebar re-registers files under a third-party id.
        if (kind === '' || kind === 'files' || provider.startsWith('@deepseek-ai/')) continue;
        kinds.add(kind);
      }
      const changed = kinds.size !== foldedKinds.size || [...kinds].some((kind) => !foldedKinds.has(kind));
      foldedKinds.clear();
      for (const kind of kinds) foldedKinds.add(kind);
      if (!changed || typeof document === 'undefined') return;
      if (foldedStyle === null) {
        foldedStyle = document.createElement('style');
        foldedStyle.dataset.minimalUiGuideFold = '';
        document.head.appendChild(foldedStyle);
      }
      // The cell wrapper carries the flex gap as well, so hide it rather than the button.
      foldedStyle.textContent = foldedKinds.size === 0 ? '' : `${[...foldedKinds]
        .map((kind) => `.p2k40q_entryCell:has([data-sidebar-right-guide-entry="${kind}"])`)
        .join(',')}{ display: none !important; }`;
    }
    // The More menu hands over the registry list, the open action and the dismiss action; a row
    // here is the folded card's only remaining door, so it opens the page exactly like the card.
    function FoldedGuideRows({ entries, onOpen, onDismiss }) {
      const icons = ensureHostIcons();
      const Row = icons && icons.MenuItemButton;
      const rows = Array.isArray(entries)
        ? entries.filter((entry) => foldedKinds.has(String(entry.id).split(':')[0]))
        : [];
      if (rows.length === 0 || typeof Row !== 'function') return null;
      return React.createElement(React.Fragment, null, rows.map((entry) => React.createElement(Row, {
        key: entry.id,
        onSelect: () => {
          if (typeof onDismiss === 'function') onDismiss();
          if (typeof onOpen === 'function') onOpen(entry.id);
        },
      }, entry.label)));
    }
    // The shipped settings dialog is a fixed, flex-centred panel, so it cannot be moved.
    // This adds a window-style drag: grab the top strip (title + header row) and the panel
    // follows the pointer, clamped inside the viewport so the title bar stays reachable.
    // Everything lives in the plugin; no host source is touched. The panel is selected by
    // its stable data attribute rather than the CSS-module hash, so a DSH upgrade that
    // renames the module prefix leaves this working; only the top-strip suffix names
    // (`_navTitle`/`_header`) are relied on, and they survive the prefix swap.
    function installSettingsDrag(doc) {
      const SELECTOR = '[data-shortcut-modal="settings"]';
      const INTERACTIVE = 'button, a, input, textarea, select, [role="button"], [contenteditable="true"]';
      const TOP_STRIP = 56; // the 54px header row plus a little slack
      const MARGIN = 8;
      let drag = null;
      const stored = (panel, key) => {
        const value = Number.parseFloat(panel.dataset[key] ?? '0');
        return Number.isFinite(value) ? value : 0;
      };
      const fullScreen = (panel) => {
        const rect = panel.getBoundingClientRect();
        return rect.width >= window.innerWidth - 2 && rect.height >= window.innerHeight - 2;
      };
      const onDown = (event) => {
        if (event.button !== 0 || event.defaultPrevented) return;
        const panel = event.target?.closest?.(SELECTOR);
        if (!panel || fullScreen(panel)) return;
        // Never start a drag from a control: the close button and header actions keep
        // their own clicks, and the nav/content below the strip stay untouched.
        if (event.target.closest?.(INTERACTIVE)) return;
        const rect = panel.getBoundingClientRect();
        if (event.clientY - rect.top > TOP_STRIP) return;
        const baseX = stored(panel, 'minimalUiDragX');
        const baseY = stored(panel, 'minimalUiDragY');
        drag = {
          panel, id: event.pointerId,
          startX: event.clientX, startY: event.clientY, baseX, baseY,
          // Untranslated geometry, so clamping stays correct on a second drag.
          left: rect.left - baseX, top: rect.top - baseY,
          width: rect.width, height: rect.height,
          moved: false,
        };
        panel.classList.add('minimalui-settings-dragging');
        event.preventDefault();
      };
      const onMove = (event) => {
        if (!drag || event.pointerId !== drag.id) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
        drag.moved = true;
        const minX = MARGIN - drag.left;
        const maxX = window.innerWidth - MARGIN - drag.width - drag.left;
        const minY = MARGIN - drag.top;
        const maxY = window.innerHeight - MARGIN - drag.height - drag.top;
        const x = Math.round(Math.min(maxX, Math.max(minX, drag.baseX + dx)));
        const y = Math.round(Math.min(maxY, Math.max(minY, drag.baseY + dy)));
        drag.panel.dataset.minimalUiDragX = String(x);
        drag.panel.dataset.minimalUiDragY = String(y);
        drag.panel.style.setProperty('--minimalui-settings-x', x + 'px');
        drag.panel.style.setProperty('--minimalui-settings-y', y + 'px');
      };
      const stop = (event) => {
        if (!drag || (event && event.pointerId !== drag.id)) return;
        drag.panel.classList.remove('minimalui-settings-dragging');
        drag = null;
      };
      doc.addEventListener('pointerdown', onDown, true);
      doc.addEventListener('pointermove', onMove, true);
      doc.addEventListener('pointerup', stop, true);
      doc.addEventListener('pointercancel', stop, true);
      return () => {
        stop();
        doc.removeEventListener('pointerdown', onDown, true);
        doc.removeEventListener('pointermove', onMove, true);
        doc.removeEventListener('pointerup', stop, true);
        doc.removeEventListener('pointercancel', stop, true);
      };
    }
    function MinimalUI() {
      try { globalThis.__minimalUiMark?.('render:MinimalUI'); } catch (error) {}
      // Document-level capture listeners, installed once and disposed with the cell.
      React.useEffect(() => installSettingsDrag(document), []);
      // Watchdog: if the dock cell never mounts, still close the menu with the editor's
      // Escape route instead of silently doing nothing. The fallback no-ops as soon as
      // the controller-backed listener is installed.
      React.useEffect(() => {
        let fallback = null;
        const timer = setTimeout(() => {
          if (!commandMenuToggleInstalled) fallback = installCommandMenuToggle(document, null);
        }, 800);
        return () => {
          clearTimeout(timer);
          fallback?.();
        };
      }, []);
      // React owns the style tag: disabling the plugin unmounts and removes it.
      return React.createElement('style', {
        'data-dsh-minimal-ui': '0.10.35',
      }, css);
    }
    bootMark('factory:plugin-ready');
    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        try {
        bootMark('apply:enter', [typeof ctx.slots, typeof ctx.slots?.inject, typeof ctx.get, typeof ctx.effect, typeof ctx.locale?.register].join(','));
        // Both sidebars open at their narrowest allowed width, and the resize handles
        // stay live: only the layout store's untouched startup values are replaced.
        ctx.effect(() => {
          let timer = 0;
          let tries = 0;
          bootMark('step:1-sidebar');
          const settle = () => {
            timer = 0;
            const declared = ctx.slots.entries('root')[0]?.store;
            const handle = typeof declared === 'function' ? declared() : declared;
            const instance = handle?.create?.();
            const layoutInfo = instance?.getSnapshot?.()?.layoutInfo;
            if (!layoutInfo || typeof instance.actions?.setSidebar !== 'function') {
              if (++tries < 100) timer = setTimeout(settle, 100);
              return;
            }
            if (layoutInfo.sidebar === 280) instance.actions.setSidebar(264);
            if (layoutInfo.rightbar === null) instance.actions.setRightbar(300);
          };
          settle();
          return () => {
            if (timer) clearTimeout(timer);
          };
        });
        bootMark('step:2-locale');
        for (const [language, dict] of Object.entries(dictionaries)) {
          ctx.effect(() => ctx.locale.register(statsNamespace, language, dict));
        }
        // Keep the sidebar toggle in step with the host palette, including the case
        // where the preference is "system" and only the OS flips the resolved scheme.
        // theme is probed rather than injected: a hard inject would keep this plugin's
        // activation open until the service exists, and the whole client boot waits on it.
        ctx.effect(() => {
          let timer = 0;
          let tries = 0;
          let release = null;
          bootMark('step:3-theme-probe');
          const adopt = (snapshot) => {
            const next = snapshot?.active?.colorScheme === 'dark' ? 'dark' : 'light';
            if (next === resolvedScheme) return;
            resolvedScheme = next;
            for (const watcher of schemeWatchers) watcher(next);
          };
          const find = () => {
            timer = 0;
            const theme = peekService(ctx, 'theme');
            if (theme === void 0) {
              if (++tries < 50) timer = setTimeout(find, 200);
              return;
            }
            adopt(theme.getTheme());
            release = ctx.on('theme/change', adopt);
          };
          find();
          return () => {
            if (timer) clearTimeout(timer);
            if (typeof release === 'function') release();
          };
        });
        // Third-party guide cards fold into More tools. The registry only exists once
        // ui-sidebar-right applied, so probe for the service instead of declaring a hard inject
        // that would hold the whole plugin back; a late registry still lands on a later try.
        ctx.effect(() => {
          let timer = 0;
          let tries = 0;
          let release = null;
          const adopt = (registry) => {
            refreshFoldedKinds(registry);
            if (release === null && typeof registry?.subscribe === 'function') {
              release = registry.subscribe(() => refreshFoldedKinds(registry));
            }
          };
          const find = () => {
            timer = 0;
            bootMark('step:4-guide-registry');
            const registry = peekService(ctx, 'sidebarRightTabs');
            if (!registry) {
              if (++tries < 50) timer = setTimeout(find, 200);
              return;
            }
            adopt(registry);
          };
          find();
          return () => {
            if (timer) clearTimeout(timer);
            if (typeof release === 'function') release();
            if (foldedStyle !== null) foldedStyle.remove();
            foldedStyle = null;
            foldedKinds.clear();
          };
        });
        // Renders no rows of its own while nothing is folded, so the shipped rows stay first.
        bootMark('step:5-guide-cell');
        ctx.slots.inject('sidebar.right.tab.guide.actions', () => ctx.slots.register({
          name: 'sidebar.right.tab.guide.actions', id: 'local-minimal-ui-guide-fold', order: -10,
        }, FoldedGuideRows));
        bootMark('step:6-footer-cell');
        ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
          name: 'sidebar.footer.action', id: 'local-minimal-ui-theme-toggle', order: 10,
          locale: statsNamespace,
          inject: () => ({
            setTheme: (id) => {
              const theme = peekService(ctx, 'theme');
              if (theme && typeof theme.setTheme === 'function') theme.setTheme(id);
            },
          }),
        }, ThemeToggle));
        bootMark('step:7-overlay-cell');
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay', id: 'local-minimal-ui', order: -100,
        }, MinimalUI));
        bootMark('step:8-stats-cell');
        ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
          name: 'conversation.input.left', id: 'local-minimal-ui-stats', order: -10,
          locale: statsNamespace,
        }, StatsToolbar));
        // Its own cell: a shipped id is not replaceable from another plugin.
        bootMark('step:9-dock-cells');
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock', id: 'local-minimal-ui-todo', order: 0,
          locale: statsNamespace,
        }, TodoPanelWithDismiss));
        // Renders nothing: it only adds the affordance inside the target message row.
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock', id: 'local-minimal-ui-edit', order: 6,
          locale: statsNamespace,
        }, EditAffordance));
        // Renders nothing: it folds each edited-files card in the transcript.
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock', id: 'local-minimal-ui-changes', order: 7,
          locale: statsNamespace,
        }, ChangesFold));
        // Renders nothing: it gives the iconified header cells a native title.
        ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
          name: 'conversation.input.dock', id: 'local-minimal-ui-header-titles', order: 8,
          locale: statsNamespace,
        }, HeaderCellTitles));
        // Resolve the session controller exactly as the host's slash-menu entry does.
        // A missing/retained-less scope must not break the dock: fall back to no controller.
        // Both services are probed for the same reason; the composer can mount long after
        // this plugin, and ctx.inject would hold activation until they appear.
        ctx.effect(() => {
          let timer = 0;
          let tries = 0;
          let disposeSlot = null;
          const find = () => {
            timer = 0;
            bootMark('step:10-input-probe');
            const inputTriggers = peekService(ctx, 'inputTriggers');
            const sessions = peekService(ctx, 'sessions');
            if (inputTriggers === void 0 || sessions === void 0) {
              if (++tries < 50) timer = setTimeout(find, 200);
              return;
            }
            disposeSlot = ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
              name: 'conversation.input.dock', id: 'local-minimal-ui-command-toggle', order: 9,
              inject: (sessionId) => {
                try {
                  return { controller: inputTriggers.sessionOf(sessions.scope(sessionId)) };
                } catch {
                  return { controller: null };
                }
              },
            }, CommandMenuToggle));
          };
          find();
          return () => {
            if (timer) clearTimeout(timer);
            if (typeof disposeSlot === 'function') disposeSlot();
          };
        });
        bootMark('apply:exit');
        } catch (minimalUiError) {
          bootMark('apply:throw ' + describeError(minimalUiError));
          throw minimalUiError;
        }
      },
    };
  },
});
