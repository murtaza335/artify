// Generates themes/*.json from scripts/palettes.js.
// Run with `npm run build:themes`. The generated JSON is committed, as VS Code reads it directly.

const fs = require('fs');
const path = require('path');
const { dark, light } = require('./palettes');

const OUT_DIR = path.join(__dirname, '..', 'themes');

function colors(p) {
  const scroll = (alpha) => p.scrollbar + alpha;
  // Optional palette keys; each falls back to the shared default when a palette omits it
  const focus = p.focus ?? p.accent;
  const marker = p.marker ?? p.accent;
  const badge = p.badge ?? { bg: p.accent, fg: p.onAccent };
  const pickRow = p.pickRow ?? { bg: p.activeRow, fg: p.activeRowFg };
  const guide = p.guide ?? p.line + (p.type === 'dark' ? '' : '55');
  return {
    // Base
    foreground: p.fg,
    descriptionForeground: p.fgMuted,
    errorForeground: p.diag.error,
    focusBorder: focus,
    'widget.shadow': p.shadow ?? '#00000055',
    'selection.background': p.selection,
    'icon.foreground': p.fg,
    'sash.hoverBorder': focus,
    'textLink.foreground': p.link,
    'textLink.activeForeground': p.accent,
    'textCodeBlock.background': p.widget,
    'progressBar.background': p.accent,

    // Buttons, badges, inputs, dropdowns
    'button.background': p.accent,
    'button.foreground': p.onAccent,
    'button.hoverBackground': p.accentHover,
    'button.secondaryBackground': p.secondaryButton,
    'button.secondaryForeground': p.secondaryButtonFg ?? (p.type === 'dark' ? p.fg : '#FFFFFF'),
    'badge.background': badge.bg,
    'badge.foreground': badge.fg,
    'input.background': p.widget,
    'input.foreground': p.fg,
    'input.border': p.widgetLine,
    'input.placeholderForeground': p.fgMuted,
    'inputOption.activeBorder': focus,
    'inputValidation.errorBorder': p.diag.error,
    'inputValidation.warningBorder': p.diag.warning,
    'inputValidation.infoBorder': p.diag.info,
    'dropdown.background': p.widget,
    'dropdown.foreground': p.fg,
    'dropdown.border': p.widgetLine,
    'checkbox.background': p.widget,
    'checkbox.border': p.widgetLine,

    // Lists and trees
    'list.activeSelectionBackground': p.activeRow,
    'list.activeSelectionForeground': p.activeRowFg,
    'list.inactiveSelectionBackground': p.inactiveRow ?? p.hoverRow,
    'list.hoverBackground': p.hoverRow,
    'list.focusOutline': focus,
    'list.highlightForeground': p.type === 'dark' ? p.accent : p.accentHover,
    'list.dropBackground': p.findSoft,
    'list.errorForeground': p.diag.error,
    'list.warningForeground': p.diag.warning,
    'tree.indentGuidesStroke': p.sidebarLine,

    // Title bar
    'titleBar.activeBackground': p.titleBg,
    'titleBar.activeForeground': p.fg,
    'titleBar.inactiveBackground': p.titleBg,
    'titleBar.inactiveForeground': p.fgMuted,
    'titleBar.border': p.line,
    'menu.background': p.widget,
    'menu.foreground': p.fg,
    'menu.selectionBackground': pickRow.bg,
    'menu.selectionForeground': pickRow.fg,
    'menu.separatorBackground': p.widgetLine,
    'menubar.selectionBackground': p.hoverRow,
    'menubar.selectionForeground': p.fg,

    // Activity bar
    'activityBar.background': p.activityBg,
    'activityBar.foreground': p.activityFg,
    'activityBar.inactiveForeground': p.activityMuted,
    'activityBar.activeBorder': p.type === 'dark' ? p.accent : '#F5C518',
    'activityBar.border': p.line,
    'activityBarBadge.background': p.type === 'dark' ? p.accent : '#F5C518',
    'activityBarBadge.foreground': p.type === 'dark' ? p.onAccent : '#12202A',

    // Side bar
    'sideBar.background': p.sidebar,
    'sideBar.foreground': p.sidebarFg,
    'sideBar.border': p.sidebarLine,
    'sideBarTitle.foreground': p.sidebarMuted,
    'sideBarSectionHeader.background': p.sidebarHeader ?? p.sidebar,
    'sideBarSectionHeader.foreground': p.type === 'dark' ? p.fg : p.sidebarFg,
    'sideBarSectionHeader.border': p.sidebarLine,

    // Editor groups and tabs
    'editorGroup.border': p.line,
    'editorGroup.dropBackground': p.findSoft,
    'editorGroupHeader.tabsBackground': p.tabBarBg,
    'editorGroupHeader.tabsBorder': p.line,
    'tab.activeBackground': p.bg,
    'tab.activeForeground': p.type === 'dark' ? '#FFFFFF' : p.fg,
    'tab.activeBorderTop': marker,
    'tab.inactiveBackground': p.tabBarBg,
    'tab.inactiveForeground': p.tabInactiveFg,
    'tab.unfocusedActiveForeground': p.tabInactiveFg,
    'tab.unfocusedInactiveForeground': p.tabInactiveFg,
    'tab.border': p.line,
    'tab.hoverBackground': p.type === 'dark' ? p.widget : p.bg,
    'tab.activeModifiedBorder': marker,
    'tab.inactiveModifiedBorder': marker,
    'breadcrumb.foreground': p.fgMuted,
    'breadcrumb.focusForeground': p.fg,
    'breadcrumb.activeSelectionForeground': p.type === 'dark' ? '#FFFFFF' : p.fg,
    'breadcrumbPicker.background': p.widget,

    // Editor
    'editor.background': p.bg,
    'editor.foreground': p.code,
    'editor.lineHighlightBackground': p.lineHighlight,
    'editor.selectionBackground': p.selection,
    'editor.inactiveSelectionBackground': p.selectionSoft,
    'editor.selectionHighlightBackground': p.selectionSoft,
    'editor.wordHighlightBackground': p.selectionSoft,
    'editor.wordHighlightStrongBackground': p.selection,
    'editor.findMatchBackground': p.find,
    'editor.findMatchHighlightBackground': p.findSoft,
    'editor.hoverHighlightBackground': p.selectionSoft,
    'editorCursor.foreground': marker,
    'editorLineNumber.foreground': p.lineNumber,
    'editorLineNumber.activeForeground': p.lineNumberActive,
    'editorIndentGuide.background1': guide,
    'editorIndentGuide.activeBackground1': p.guideActive ?? (p.type === 'dark' ? '#6B4A58' : '#12202A99'),
    'editorWhitespace.foreground': guide,
    'editorRuler.foreground': guide,
    'editorBracketMatch.background': p.findSoft,
    'editorBracketMatch.border': focus,
    'editorBracketHighlight.foreground1': p.brackets[0],
    'editorBracketHighlight.foreground2': p.brackets[1],
    'editorBracketHighlight.foreground3': p.brackets[2],
    'editorBracketHighlight.foreground4': p.brackets[3],
    'editorBracketHighlight.foreground5': p.brackets[4],
    'editorBracketHighlight.foreground6': p.brackets[5],
    'editorBracketHighlight.unexpectedBracket.foreground': p.diag.error,
    'editorLink.activeForeground': p.link,
    'editorError.foreground': p.diag.error,
    'editorWarning.foreground': p.diag.warning,
    'editorInfo.foreground': p.diag.info,
    'editorHint.foreground': p.diag.hint,
    'editorGutter.background': p.bg,
    'editorGutter.addedBackground': p.diag.hint,
    'editorGutter.modifiedBackground': p.diag.info,
    'editorGutter.deletedBackground': p.diag.error,
    'editorOverviewRuler.border': p.line,
    'diffEditor.insertedTextBackground': p.diff?.inserted ?? p.git.untracked + '26',
    'diffEditor.removedTextBackground': p.diff?.removed ?? p.git.deleted + '26',

    // Widgets: suggest, hover, find, peek, notifications, quick input
    'editorWidget.background': p.widget,
    'editorWidget.foreground': p.fg,
    'editorWidget.border': p.widgetLine,
    'editorSuggestWidget.background': p.widget,
    'editorSuggestWidget.foreground': p.fg,
    'editorSuggestWidget.border': p.widgetLine,
    'editorSuggestWidget.selectedBackground': pickRow.bg,
    'editorSuggestWidget.selectedForeground': pickRow.fg,
    'editorSuggestWidget.highlightForeground': p.type === 'dark' ? p.accent : p.accentHover,
    'editorHoverWidget.background': p.widget,
    'editorHoverWidget.foreground': p.fg,
    'editorHoverWidget.border': p.widgetLine,
    'peekView.border': focus,
    'peekViewEditor.background': p.widget,
    'peekViewResult.background': p.sidebar,
    'peekViewTitle.background': p.widget,
    'peekViewTitleLabel.foreground': p.fg,
    'peekViewResult.selectionBackground': p.activeRow,
    'peekViewResult.selectionForeground': p.activeRowFg,
    'notifications.background': p.widget,
    'notifications.foreground': p.fg,
    'notifications.border': p.widgetLine,
    'notificationCenterHeader.background': p.widget,
    'quickInput.background': p.widget,
    'quickInput.foreground': p.fg,
    'quickInputList.focusBackground': pickRow.bg,
    'quickInputList.focusForeground': pickRow.fg,
    'pickerGroup.foreground': p.type === 'dark' ? p.accent : p.accentHover,
    'pickerGroup.border': p.widgetLine,

    // Minimap and scrollbars
    'minimap.background': p.bg,
    'minimap.selectionHighlight': p.selection,
    'minimap.errorHighlight': p.diag.error,
    'minimap.warningHighlight': p.diag.warning,
    'minimapSlider.background': scroll('1A'),
    'minimapSlider.hoverBackground': scroll('26'),
    'minimapSlider.activeBackground': scroll('33'),
    'scrollbarSlider.background': scroll('22'),
    'scrollbarSlider.hoverBackground': scroll('33'),
    'scrollbarSlider.activeBackground': scroll('44'),

    // Panel and terminal
    'panel.background': p.panel,
    'panel.border': p.line,
    'panelTitle.activeForeground': p.type === 'dark' ? '#FFFFFF' : p.fg,
    'panelTitle.inactiveForeground': p.fgMuted,
    'panelTitle.activeBorder': marker,
    'panelSectionHeader.background': p.panel,
    'terminal.background': p.panel,
    'terminal.foreground': p.type === 'dark' ? '#E6DDD0' : p.fg,
    'terminal.selectionBackground': p.selection,
    'terminalCursor.foreground': marker,
    'terminal.ansiBlack': p.ansi.black,
    'terminal.ansiRed': p.ansi.red,
    'terminal.ansiGreen': p.ansi.green,
    'terminal.ansiYellow': p.ansi.yellow,
    'terminal.ansiBlue': p.ansi.blue,
    'terminal.ansiMagenta': p.ansi.magenta,
    'terminal.ansiCyan': p.ansi.cyan,
    'terminal.ansiWhite': p.ansi.white,
    'terminal.ansiBrightBlack': p.ansi.brightBlack,
    'terminal.ansiBrightRed': p.ansi.brightRed,
    'terminal.ansiBrightGreen': p.ansi.brightGreen,
    'terminal.ansiBrightYellow': p.ansi.brightYellow,
    'terminal.ansiBrightBlue': p.ansi.brightBlue,
    'terminal.ansiBrightMagenta': p.ansi.brightMagenta,
    'terminal.ansiBrightCyan': p.ansi.brightCyan,
    'terminal.ansiBrightWhite': p.ansi.brightWhite,

    // Status bar
    'statusBar.background': p.status.bg,
    'statusBar.foreground': p.status.fg,
    'statusBar.border': p.status.border ?? (p.type === 'dark' ? p.status.bg : '#12202A'),
    'statusBar.noFolderBackground': p.prominent.bg,
    'statusBar.noFolderForeground': p.prominent.fg,
    'statusBar.debuggingBackground': p.debugging.bg,
    'statusBar.debuggingForeground': p.debugging.fg,
    'statusBarItem.hoverBackground': '#00000026',
    'statusBarItem.remoteBackground': p.remote.bg,
    'statusBarItem.remoteForeground': p.remote.fg,
    'statusBarItem.prominentBackground': p.prominent.bg,
    'statusBarItem.prominentForeground': p.prominent.fg,
    'statusBarItem.warningBackground': p.warning.bg,
    'statusBarItem.warningForeground': p.warning.fg,
    'statusBarItem.errorBackground': p.error.bg,
    'statusBarItem.errorForeground': p.error.fg,

    // Source control decorations
    'gitDecoration.modifiedResourceForeground': p.git.modified,
    'gitDecoration.untrackedResourceForeground': p.git.untracked,
    'gitDecoration.deletedResourceForeground': p.git.deleted,
    'gitDecoration.conflictingResourceForeground': p.git.conflict,
    'gitDecoration.ignoredResourceForeground': p.git.ignored,

    // Extensions and debugging
    'extensionButton.prominentBackground': p.accent,
    'extensionButton.prominentForeground': p.onAccent,
    'extensionButton.prominentHoverBackground': p.accentHover,
    'debugToolBar.background': p.widget,
    'debugToolBar.border': p.widgetLine,

    // Palette-specific extras that have no shared default
    ...p.extra
  };
}

function tokenColors(p) {
  const t = p.t;
  const rule = (name, scope, foreground, fontStyle) => {
    const settings = { foreground };
    if (fontStyle) settings.fontStyle = fontStyle;
    return { name, scope, settings };
  };
  return [
    rule('Comments', ['comment', 'punctuation.definition.comment'], t.comment, 'italic'),
    rule('Keywords', ['keyword', 'keyword.control', 'storage', 'storage.type', 'storage.modifier'], t.keyword),
    rule('Operators', ['keyword.operator'], t.operator),
    rule('Punctuation', ['punctuation', 'meta.brace', 'meta.delimiter'], t.punct),
    rule('Strings', ['string', 'string.quoted', 'punctuation.definition.string'], t.string),
    rule('Escapes', ['constant.character.escape', 'string.regexp constant.character.escape'], t.escape),
    rule('Regular expressions', ['string.regexp'], t.regex),
    rule('Numbers and constants', ['constant.numeric', 'constant.language', 'constant.other', 'support.constant'], t.number),
    rule('Functions', ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'], t.func),
    rule('Types and classes', ['entity.name.type', 'entity.name.class', 'entity.other.inherited-class', 'support.type', 'support.class', 'storage.type.class'], t.type),
    rule('Namespaces', ['entity.name.namespace', 'entity.name.module'], t.namespace),
    rule('Variables', ['variable', 'variable.other.readwrite'], t.variable),
    rule('Parameters', ['variable.parameter'], t.param),
    rule('Properties', ['variable.other.property', 'variable.other.object.property', 'support.type.property-name', 'meta.object-literal.key'], t.property),
    rule('Decorators', ['meta.decorator', 'entity.name.function.decorator', 'punctuation.decorator'], t.decorator),
    rule('Tags', ['entity.name.tag', 'punctuation.definition.tag'], t.tag),
    rule('Attributes', ['entity.other.attribute-name'], t.attr),
    rule('CSS properties', ['support.type.property-name.css', 'meta.property-name.css'], t.func),
    rule('CSS values', ['support.constant.property-value.css', 'meta.property-value.css'], t.string),
    rule('JSON keys', ['support.type.property-name.json'], t.func),
    rule('Markdown headings', ['markup.heading', 'entity.name.section.markdown'], t.heading, 'bold'),
    rule('Markdown bold', ['markup.bold'], t.variable, 'bold'),
    rule('Markdown italic', ['markup.italic'], t.variable, 'italic'),
    rule('Markdown links', ['markup.underline.link', 'string.other.link'], p.link),
    rule('Markdown code', ['markup.inline.raw', 'markup.fenced_code'], t.string),
    rule('Diff inserted', ['markup.inserted'], t.inserted),
    rule('Diff deleted', ['markup.deleted'], t.deleted),
    rule('Invalid', ['invalid', 'invalid.illegal'], t.invalid, 'underline')
  ];
}

function semanticTokenColors(p) {
  const t = p.t;
  return {
    namespace: t.namespace,
    class: t.type,
    interface: t.type,
    enum: t.type,
    type: t.type,
    typeParameter: { foreground: t.type, fontStyle: 'italic' },
    function: t.func,
    method: t.func,
    decorator: t.decorator,
    parameter: t.param,
    property: t.property,
    variable: t.variable,
    'variable.readonly': t.constant,
    enumMember: t.constant,
    keyword: t.keyword,
    comment: { foreground: t.comment, fontStyle: 'italic' }
  };
}

function build(p) {
  return {
    $schema: 'vscode://schemas/color-theme',
    name: p.name,
    type: p.type,
    semanticHighlighting: true,
    colors: colors(p),
    tokenColors: tokenColors(p),
    semanticTokenColors: semanticTokenColors(p)
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const p of [dark, light]) {
  const file = path.join(OUT_DIR, p.file);
  fs.writeFileSync(file, JSON.stringify(build(p), null, 2) + '\n');
  console.log('wrote', path.relative(process.cwd(), file));
}
