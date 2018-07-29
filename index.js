const css = require('css');
const fromPairs = require('lodash/fromPairs');
const map = require('lodash/map');
const orderBy = require('lodash/orderBy');
const reject = require('lodash/reject');
const uniq = require('lodash/uniq');

const COMMA = ',';
const SPACE = ' ';

function isNested(selector) {
  const parts = selector.split(COMMA);
  if (parts.some(part => part.indexOf(SPACE) > -1)) {
    if (parts.length === 1) {
      return true;
    }

    const parents = uniq(parts.map(part => part.split(SPACE)[0]));
    if (parents.length === 1) {
      return true;
    }
  }

  return false;
}

function cleanup(styles) {
  const cleaned = {};
  for (let selector in styles) {
    let value = styles[selector];
    if (typeof value === 'object') {
      selector = selector.replace(/\s&/, '');
      value = cleanup(value);
    }

    cleaned[selector] = value;
  }

  return cleaned;
}

function render(styles) {
  let text = '';
  for (const key in styles) {
    const value = styles[key];
    if (typeof value === 'object') {
      text += `
        ${key} {
          ${render(value)}
        }
      `;
      continue;
    }

    text += `${key}: ${value};`;
  }

  return text;
}

module.exports = function(code) {
  const parsed = css.parse(code);
  const rules = reject(parsed.stylesheet.rules, 'comment');
  const styles = rules.reduce((obj, rule) => {
    const declarations = fromPairs(
      rule.declarations.map(declaration => [
        declaration.property,
        declaration.value
      ])
    );

    const selector = rule.selectors
      .toString()
      .replace(/\s+/, SPACE)
      .replace(/(\w+)((#|\.)\w+)/, '$1 &$2');
    const existing = obj[selector] || {};
    const merged = {
      ...existing,
      ...declarations
    };

    return {
      ...obj,
      [selector]: merged
    };
  }, {});

  const selectors = Object.keys(styles);
  const nested = orderBy(
    selectors.filter(isNested),
    selector => selector.split(SPACE).length,
    'desc'
  );

  nested.forEach(selector => {
    if (selector.indexOf(COMMA) > -1) {
      // we're dealing with multiple nested selectors
      const parts = selector.split(COMMA).map(part => part.split(SPACE));
      let offset = Math.min(...map(parts, 'length')) - 1;
      while (offset > 0) {
        const parents = parts.map(part => part.slice(0, offset).join(SPACE));
        if (uniq(parents).length === 1) {
          const parent = parents[0];
          if (styles[parent]) {
            const child = parts.map(part => part.slice(offset).join(SPACE));
            styles[parent] = {
              ...styles[parent],
              [child]: styles[selector]
            };

            delete styles[selector];
            break;
          }
        }

        offset--;
      }
      return;
    }

    // try to find a home for a single nested selector
    let lastIndex = selector.length;
    while (lastIndex > -1) {
      const index = selector.lastIndexOf(SPACE, lastIndex);
      if (index > -1) {
        const parent = selector.slice(0, index);
        if (styles[parent]) {
          const child = selector.slice(index + 1);
          styles[parent] = {
            ...styles[parent],
            [child]: styles[selector]
          };

          delete styles[selector];
          break;
        }
      }

      lastIndex = index - 1;
    }
  });

  return render(cleanup(styles));
};
