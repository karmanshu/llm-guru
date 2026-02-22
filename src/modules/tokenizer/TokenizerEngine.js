// TokenizerEngine.js — BPE-like subword tokenization (pure functions)

const PREFIXES = ['un', 're', 'pre', 'dis', 'mis', 'over', 'out', 'sub', 'super', 'inter'];
const SUFFIXES = ['ing', 'tion', 'sion', 'ment', 'ness', 'able', 'ible', 'ful', 'less', 'ous', 'ive', 'ly', 'ed', 'er', 'est', 'al', 'ity', 'ize', 'ise'];

function decomposeWord(word) {
  const lower = word.toLowerCase();
  if (lower.length < 4) return [{ text: word, type: 'standalone' }];

  for (const p of PREFIXES) {
    if (lower.startsWith(p) && lower.length > p.length + 2) {
      const rest = word.slice(p.length);
      const restLower = rest.toLowerCase();
      for (const s of SUFFIXES) {
        if (restLower.endsWith(s) && restLower.length > s.length + 1) {
          const root = rest.slice(0, rest.length - s.length);
          return [
            { text: word.slice(0, p.length), type: 'prefix' },
            { text: root, type: 'root' },
            { text: rest.slice(rest.length - s.length), type: 'suffix' },
          ];
        }
      }
      return [
        { text: word.slice(0, p.length), type: 'prefix' },
        { text: rest, type: 'root' },
      ];
    }
  }

  for (const s of SUFFIXES) {
    if (lower.endsWith(s) && lower.length > s.length + 2) {
      return [
        { text: word.slice(0, word.length - s.length), type: 'root' },
        { text: word.slice(word.length - s.length), type: 'suffix' },
      ];
    }
  }

  return [{ text: word, type: 'standalone' }];
}

export function tokenize(text) {
  if (!text || !text.trim()) return [];

  const tokens = [];
  // Split into raw parts: words, punctuation, spaces
  const parts = text.match(/[\w']+|[^\w\s]|\s+/g) || [];

  parts.forEach(part => {
    if (/^\s+$/.test(part)) {
      tokens.push({ text: '·', type: 'space', original: part });
    } else if (/^[^\w\s]$/.test(part)) {
      tokens.push({ text: part, type: 'punct', original: part });
    } else {
      const subwords = decomposeWord(part);
      subwords.forEach(sw => tokens.push({ ...sw, original: sw.text }));
    }
  });

  return tokens;
}

export const TOKEN_COLORS = {
  standalone: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.35)', label: 'Word' },
  prefix: { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.35)', label: 'Prefix' },
  suffix: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)', label: 'Suffix' },
  root: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)', label: 'Root' },
  punct: { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.35)', label: 'Punct' },
  space: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', label: 'Space' },
};
