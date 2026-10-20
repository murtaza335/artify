// Single source of truth for both Artify themes.
// Every foreground/background pair is checked by scripts/check-contrast.js.

const dark = {
  name: 'Artify Tile Night',
  file: 'artify-tile-night-color-theme.json',
  type: 'dark',

  // Surfaces
  bg: '#1B1016',
  titleBg: '#0F0A0E',
  activityBg: '#0F0A0E',
  tabBarBg: '#0F0A0E',
  sidebar: '#10232B',
  panel: '#150C11',
  widget: '#241520',
  line: '#3A2630',
  sidebarLine: '#25414A',
  widgetLine: '#4A3040',

  // UI text
  fg: '#F3EBDD',
  fgMuted: '#B9A8AE',
  sidebarFg: '#D7D0C4',
  sidebarMuted: '#A8BCC2',
  tabInactiveFg: '#C9B8BE',
  activityFg: '#FFFFFF',
  activityMuted: '#B9A8AE',

  // Editor text
  code: '#FFF3E0',
  lineNumber: '#94808B',
  lineNumberActive: '#FFFFFF',

  // Interaction
  accent: '#E9A93B',
  accentHover: '#F2B134',
  onAccent: '#1B1016',
  link: '#62C3E3',
  activeRow: '#1A3540',
  activeRowFg: '#FFFFFF',
  hoverRow: '#16303A',
  selection: '#62C3E340',
  selectionSoft: '#62C3E322',
  lineHighlight: '#FFFFFF0F',
  find: '#E9A93B66',
  findSoft: '#E9A93B33',
  secondaryButton: '#3A2630',
  scrollbar: '#F3EBDD',

  // Status bar: ochre bar with colour-blocked remote and state items
  status: { bg: '#E9A93B', fg: '#1B1016' },
  remote: { bg: '#E5534B', fg: '#0F0A0E' },
  prominent: { bg: '#3F8793', fg: '#0F0A0E' },
  warning: { bg: '#62C3E3', fg: '#0F0A0E' },
  error: { bg: '#C9373A', fg: '#FFFFFF' },
  debugging: { bg: '#F79BB0', fg: '#0F0A0E' },

  // Syntax
  t: {
    comment: '#9A8691',
    keyword: '#FF7A6B',
    string: '#9BDB8A',
    number: '#F2B134',
    constant: '#F2B134',
    func: '#62C3E3',
    type: '#F79BB0',
    variable: '#FFF3E0',
    param: '#FFD9A8',
    property: '#FFF3E0',
    punct: '#C9B8BE',
    operator: '#C9B8BE',
    regex: '#5FD3C9',
    escape: '#F2B134',
    tag: '#FF7A6B',
    attr: '#F2B134',
    heading: '#F2B134',
    decorator: '#F79BB0',
    namespace: '#F79BB0',
    invalid: '#FF9A8D',
    inserted: '#9BDB8A',
    deleted: '#FF7A6B'
  },

  brackets: ['#F2B134', '#F79BB0', '#62C3E3', '#9BDB8A', '#FF7A6B', '#FFF0B8'],
  diag: { error: '#FF7A6B', warning: '#F2B134', info: '#62C3E3', hint: '#9BDB8A' },
  git: { modified: '#62C3E3', untracked: '#9BDB8A', deleted: '#FF7A6B', conflict: '#F2B134', ignored: '#8C7A83' },

  ansi: {
    black: '#3A2630', red: '#FF7A6B', green: '#9BDB8A', yellow: '#F2B134',
    blue: '#62C3E3', magenta: '#F79BB0', cyan: '#5FD3C9', white: '#E6DDD0',
    brightBlack: '#94808B', brightRed: '#FF9A8D', brightGreen: '#B5E8A6', brightYellow: '#FFD166',
    brightBlue: '#8AD6F0', brightMagenta: '#FFB7C8', brightCyan: '#8DE5DC', brightWhite: '#FFFFFF'
  },
  // ANSI black is a surface-like colour, so it is exempt from the text contrast check.
  ansiExempt: ['black']
};

const light = {
  name: 'Artify Bauhaus Day',
  file: 'artify-bauhaus-day-color-theme.json',
  type: 'light',

  bg: '#FFFBF0',
  titleBg: '#FFFBF0',
  activityBg: '#12202A',
  tabBarBg: '#F5EBCF',
  sidebar: '#CFEAF4',
  panel: '#F5EBCF',
  widget: '#FFFFFF',
  line: '#12202A',
  sidebarLine: '#12202A',
  widgetLine: '#12202A',

  fg: '#1B2A33',
  fgMuted: '#4B5760',
  sidebarFg: '#12202A',
  sidebarMuted: '#2F4452',
  tabInactiveFg: '#2F4452',
  activityFg: '#FFFFFF',
  activityMuted: '#B7C6CE',

  code: '#1B2A33',
  lineNumber: '#6E6660',
  lineNumberActive: '#1B2A33',

  accent: '#D83A2E',
  accentHover: '#B8261F',
  onAccent: '#FFFFFF',
  link: '#1C55A5',
  activeRow: '#FFFFFF',
  activeRowFg: '#12202A',
  hoverRow: '#E4F3F9',
  selection: '#62C3E366',
  selectionSoft: '#62C3E333',
  lineHighlight: '#F5C51833',
  find: '#F5C51899',
  findSoft: '#F5C51855',
  secondaryButton: '#12202A',
  scrollbar: '#12202A',

  status: { bg: '#F5C518', fg: '#12202A' },
  remote: { bg: '#D83A2E', fg: '#FFFFFF' },
  prominent: { bg: '#1E7B8F', fg: '#FFFFFF' },
  warning: { bg: '#62C3E3', fg: '#12202A' },
  error: { bg: '#B8261F', fg: '#FFFFFF' },
  debugging: { bg: '#F28FA6', fg: '#12202A' },

  t: {
    comment: '#6E6660',
    keyword: '#B8261F',
    string: '#0E6B7D',
    number: '#8A5A00',
    constant: '#8A5A00',
    func: '#1C55A5',
    type: '#A12B63',
    variable: '#1B2A33',
    param: '#6B3F9A',
    property: '#1B2A33',
    punct: '#4B5760',
    operator: '#4B5760',
    regex: '#00596A',
    escape: '#8A5A00',
    tag: '#B8261F',
    attr: '#8A5A00',
    heading: '#8A5A00',
    decorator: '#A12B63',
    namespace: '#A12B63',
    invalid: '#B8261F',
    inserted: '#2F7A3B',
    deleted: '#B8261F'
  },

  brackets: ['#8A5A00', '#A12B63', '#1C55A5', '#2F7A3B', '#B8261F', '#6B3F9A'],
  diag: { error: '#B8261F', warning: '#8A5A00', info: '#1C55A5', hint: '#2F7A3B' },
  git: { modified: '#1C55A5', untracked: '#2F7A3B', deleted: '#B8261F', conflict: '#8A5A00', ignored: '#6E7A82' },

  ansi: {
    black: '#12202A', red: '#B8261F', green: '#2A7236', yellow: '#8A5A00',
    blue: '#1C55A5', magenta: '#A12B63', cyan: '#0E6B7D', white: '#5A6670',
    brightBlack: '#4B5760', brightRed: '#C21F15', brightGreen: '#2A7236', brightYellow: '#8A5A00',
    brightBlue: '#1C55A5', brightMagenta: '#8E2257', brightCyan: '#00596A', brightWhite: '#3B4850'
  },
  ansiExempt: []
};

module.exports = { dark, light };
