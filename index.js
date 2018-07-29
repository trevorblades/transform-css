import css from 'css';
import indentString from 'indent-string';
import fromPairs from 'lodash/fromPairs';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import reject from 'lodash/reject';
import repeat from 'lodash/repeat';
import uniq from 'lodash/uniq';

const SPACE = ' ';
const COMMA_SPACE = ', ';

function isNested(selector) {
  const parts = selector.split(COMMA_SPACE);
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
      selector = selector.replace(/\s&/g, '');
      value = cleanup(value);
    }

    cleaned[selector] = value;
  }

  return cleaned;
}

function render(styles, count, options) {
  let text = '';
  let index = -1;

  const omitBracketsAndSemicolons = options.omitBracketsAndSemicolons === true;
  const indent = string =>
    indentString(string, count, {
      indent:
        options.spaces !== false
          ? repeat(' ', Number.isInteger(options.spaces) ? options.spaces : 2)
          : '\t'
    });

  for (const key in styles) {
    index++;

    const value = styles[key];
    if (typeof value === 'object') {
      if (index > 0) {
        text += '\n';
      }

      text += indent(key);
      if (!omitBracketsAndSemicolons) {
        text += ' {';
      }

      text += `\n${render(value, count + 1, options)}`;
      if (!omitBracketsAndSemicolons) {
        text += indent('}\n');
      }

      continue;
    }

    text += indent(`${key}: ${value}`);
    if (!omitBracketsAndSemicolons) {
      text += ';';
    }

    text += '\n';
  }

  return text;
}

export default function parse(code, options = {}) {
  const parsed = css.parse(code);

  // TODO: support comments
  const rules = reject(parsed.stylesheet.rules, 'comment');
  const styles = rules.reduce((obj, rule) => {
    const declarations = fromPairs(
      rule.declarations.map(declaration => [
        declaration.property,
        declaration.value
      ])
    );

    const selector = rule.selectors
      .join(COMMA_SPACE)
      .replace(/\s+/g, SPACE)
      .replace(/(\w+)((#|\.|:)\w+)/g, '$1 &$2');
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
    if (selector.indexOf(COMMA_SPACE) > -1) {
      // we're dealing with multiple nested selectors
      const parts = selector.split(COMMA_SPACE).map(part => part.split(SPACE));
      let offset = Math.min(...map(parts, 'length')) - 1;
      while (offset > 0) {
        const parents = parts.map(part => part.slice(0, offset).join(SPACE));
        if (uniq(parents).length === 1) {
          const parent = parents[0];
          if (styles[parent]) {
            const child = parts
              .map(part => part.slice(offset).join(SPACE))
              .join(COMMA_SPACE);
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

  const cleaned = cleanup(styles);
  return render(cleaned, 0, options).replace(/\s+$/, '');
}
