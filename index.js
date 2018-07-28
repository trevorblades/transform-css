const Color = require('color');

// TODO: prevent capturing spaces at the end of a match so we don't need to use trim() everywhere
const SELECTOR_PATTERN = /(.+?){\s*([\S\s]*?)\s*\}/gm;
const COMMENT_PATTERN = /\/\*([\S\s]*?)\*\//gm;
const COLOR_PATTERN = /(?:#((?:[0-9a-f]{3}){1,2})|((?:rgb|hsl)a?)\((25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*(?:,\s*(1(?:\.0)?|(?:0|0?\.\d\d?)))?\))/gim;

function scrape(css) {
  const styles = {};
  const colors = {};

  // TODO: use css.match(SELECTOR_PATTERN) instead
  let match = SELECTOR_PATTERN.exec(css);
  while (match) {
    const selector = match[1].trim();

    // Split apart the style properties
    // TODO: use a fat arrow function for this filter?
    const rules = match[2]
      .trim()
      .split(';')
      .filter(function(rule) {
        return rule;
      })
      .reduce(function(a, b) {
        const rule = b.split(':').filter(function(rule) {
          return rule;
        });
        if (rule.length > 1) {
          let value = rule[1].trim();

          // Check if the value is a color (hex, rgb, or hsl)
          const colorMatch = value.match(COLOR_PATTERN);
          if (colorMatch) {
            for (let i = colorMatch.length - 1; i >= 0; i--) {
              // Format the color appropriately
              // TODO: make color formatting optional
              const color = new Color(colorMatch[i]);
              const colorString =
                color.alpha() === 1
                  ? color.hexString().toLowerCase()
                  : color.rgbString();

              // Increment count for the color
              if (!colors[colorString]) {
                colors[colorString] = 0;
              }
              colors[colorString] += 1;
              value = value.replace(colorMatch[i], colorString);
            }
          }

          a[rule[0].trim()] = value;
        }
        return a;
      }, {});

    // Assign styles to the selector or define a new selector
    if (styles[selector]) {
      styles[selector].rules = Object.assign(styles[selector].rules, rules);
    } else {
      styles[selector] = {
        index: match.index,
        rules
      };
    }

    match = SELECTOR_PATTERN.exec(css);
  }

  return {
    styles,
    colors
  };
}

function sort(styles) {
  // Move subclasses to the top of the list of children
  const selectors = Object.keys(styles).reverse();
  for (let i = selectors.length - 1; i >= 0; i--) {
    const nextIndex =
      selectors[i].indexOf('&') === 0 ? 0 : selectors.length - 1;
    selectors.splice(nextIndex, 0, selectors.splice(i, 1)[0]);
  }

  const sorted = {};
  selectors.forEach(function(selector) {
    sorted[selector] = styles[selector];
  });

  return sorted;
}

function scrub(styles) {
  const selectors = Object.keys(styles);
  for (const key in styles) {
    let selectorIndex = -1;
    for (let i = 0; i < selectors.length; i++) {
      if (key !== selectors[i] && key.indexOf(selectors[i]) === 0) {
        selectorIndex = i;
      }
    }

    if (selectorIndex > -1) {
      const parentSelector = selectors[selectorIndex];
      if (key !== parentSelector) {
        if (!styles[parentSelector].children) {
          styles[parentSelector].children = {};
        }

        let childSelector = key.replace(parentSelector, '');
        if (childSelector.charAt(0) !== ' ') {
          childSelector = '&' + childSelector;
        }

        styles[parentSelector].children[childSelector.trim()] = styles[key];
        styles[parentSelector].children = sort(styles[parentSelector].children);

        styles[key].nested = true;
      }
    }
  }

  return styles;
}

function rinse(styles) {
  for (const key in styles) {
    if (styles[key].nested) {
      delete styles[key];
    }
  }
  return styles;
}

function indent(level, options) {
  const useTabs = options && options.useTabs;
  return (useTabs ? '\t' : ' ').repeat((useTabs ? 1 : 2) * level);
}

function print(styles, colors, comments, options, start) {
  let output = '';
  const level = (options && options.level) || 0;
  const variableSymbol =
    options && options.language && options.language.search(/s[ac]ss/) > -1
      ? '$'
      : '@';

  if (colors && colors.length && start) {
    if (!options || options.includeComments) {
      output += '// Color variables\n';
    }
    colors.forEach(function(color, index) {
      output += variableSymbol + 'var' + (index + 1) + ': ' + color + ';\n';
    });
    output += '\n';
  }

  for (const selector in styles) {
    const style = styles[selector];

    // Print the comments
    if (comments && comments.length) {
      let commentIndex = -1;
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].index < style.index) {
          commentIndex = i;
        }
      }
      if (commentIndex > -1) {
        if (output.length > 0 && output.charAt(output.length - 1) !== '\n') {
          output += '\n';
        }
        output +=
          indent(level, options) + '// ' + comments[commentIndex].text + '\n';
        comments.splice(commentIndex, 1);
      }
    }

    // Print the styles
    output += indent(level, options) + selector;
    if (!options || options.language !== 'sass') {
      output += ' {';
    }
    output += '\n';

    for (const property in style.rules) {
      output += indent(level + 1, options);
      output += property + ': ';

      // Replace colors with variables
      if (
        colors &&
        new RegExp(colors.join('|'), 'g').test(style.rules[property])
      ) {
        colors.forEach(function(color, index) {
          style.rules[property] = style.rules[property].replace(
            new RegExp(color, 'g'),
            variableSymbol + 'var' + (index + 1)
          );
        });
      }

      output += style.rules[property];
      output += ';\n';
    }

    if (style.children) {
      output += print(
        style.children,
        colors,
        comments,
        Object.assign(options || {}, {level: level + 1})
      );
    }
    output += indent(level, options);
    if (!options || options.language !== 'sass') {
      output += '}';
    }
    output += '\n';

    if (!level) {
      output += '\n';
    }
  }

  return output;
}

function prepare(css) {
  // Scrape the CSS for styles and colors
  const scrapings = scrape(css);
  const styles = rinse(scrub(scrapings.styles));
  const colors = [];

  // Create array of colors that occur more than once
  for (const color in scrapings.colors) {
    if (scrapings.colors[color] > 1) {
      colors.push(color);
    }
  }

  // Get the comments
  const comments = [];
  let match = COMMENT_PATTERN.exec(css);
  while (match) {
    comments.push({
      index: match.index,
      text: match[1].trim()
    });
    match = COMMENT_PATTERN.exec(css);
  }

  return {
    styles,
    colors,
    comments
  };
}

// Options include...
// language [string] Accepts 'less', 'sass', and 'scss' (default is 'less')
// createVariables [bool] Whether or not color variables are created
// includeComments [bool] Whether or not comments are included
// useTabs [bool] If you prefer to use tabs rather than spaces
export default function parse(css, options = {}) {
  const results = prepare(css);
  return print(
    results.styles,
    options.createVariables && results.colors,
    options.includeComments && results.comments,
    options,
    true
  );
}
