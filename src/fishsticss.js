var Color = require('color');

// TODO: prevent capturing spaces at the end of a match so we don't need to use trim() everywhere
var SELECTOR_PATTERN = /(.+?){\s*([\S\s]*?)\s*\}/gm;
var COMMENT_PATTERN = /\/\*([\S\s]*?)\*\//gm;
var COLOR_PATTERN = /(?:#((?:[0-9a-f]{3}){1,2})|((?:rgb|hsl)a?)\((25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*(?:,\s*(1(?:\.0)?|(?:0|0?\.\d\d?)))?\))/gim;

var fishsticss = {

  _scrape: function(css) {

    var styles = {};
    var colors = {};

    // TODO: use css.match(SELECTOR_PATTERN) instead
    var match = SELECTOR_PATTERN.exec(css);
    while (match) {

      var selector = match[1].trim();

      // Split apart the style properties
      // TODO: use a fat arrow function for this filter?
      var rules = match[2].trim().split(';').filter(function(rule) {
        return rule;
      }).reduce(function(a, b) {

        var rule = b.split(':').filter(function(rule) {
          return rule;
        });
        if (rule.length > 1) {

          var value = rule[1].trim();

          // Check if the value is a color (hex, rgb, or hsl)
          var colorMatch = value.match(COLOR_PATTERN);
          if (colorMatch) {
            for (var i = colorMatch.length - 1; i >= 0; i--) {
              // Format the color appropriately
              // TODO: make color formatting optional
              var color = new Color(colorMatch[i]);
              var colorString = color.alpha() === 1 ?
                  color.hexString().toLowerCase() : color.rgbString();

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
          rules: rules
        };
      }

      match = SELECTOR_PATTERN.exec(css);
    }

    return {
      styles: styles,
      colors: colors
    };
  },

  _sort: function(styles) {

    // Move subclasses to the top of the list of children
    var selectors = Object.keys(styles).reverse();
    for (var i = selectors.length - 1; i >= 0; i--) {
      var nextIndex = selectors[i].indexOf('&') === 0 ?
          0 : selectors.length - 1;
      selectors.splice(nextIndex, 0, selectors.splice(i, 1)[0]);
    }

    var sorted = {};
    selectors.forEach(function(selector) {
      sorted[selector] = styles[selector];
    });

    return sorted;
  },

  _scrub: function(styles) {

    var selectors = Object.keys(styles);
    for (var key in styles) {

      var selectorIndex = -1;
      for (var i = 0; i < selectors.length; i++) {
        if (key !== selectors[i] && key.indexOf(selectors[i]) === 0) {
          selectorIndex = i;
        }
      }

      if (selectorIndex > -1) {

        var parentSelector = selectors[selectorIndex];
        if (key !== parentSelector) {

          if (!styles[parentSelector].children) {
            styles[parentSelector].children = {};
          }

          var childSelector = key.replace(parentSelector, '');
          if (childSelector.charAt(0) !== ' ') {
            childSelector = '&' + childSelector;
          }

          styles[parentSelector].children[childSelector.trim()] = styles[key];
          styles[parentSelector].children = this._sort(styles[parentSelector].children);

          styles[key].nested = true;
        }
      }
    }

    return styles;
  },

  _rinse: function(styles) {
    for (var key in styles) {
      if (styles[key].nested) {
        delete styles[key];
      }
    }
    return styles;
  },

  prepare: function(css) {

    // Scrape the CSS for styles and colors
    var scrapings = this._scrape(css);
    var styles = this._rinse(this._scrub(scrapings.styles));
    var colors = [];

    // Create array of colors that occur more than once
    for (var color in scrapings.colors) {
      if (scrapings.colors[color] > 1) {
        colors.push(color);
      }
    }

    // Get the comments
    var comments = [];
    var match = COMMENT_PATTERN.exec(css);
    while (match) {
      comments.push({
        index: match.index,
        text: match[1].trim()
      });
      match = COMMENT_PATTERN.exec(css);
    }

    return {
      styles: styles,
      colors: colors,
      comments: comments
    };
  },

  _indent: function(level, options) {
    var useTabs = options && options.useTabs;
    return (useTabs ? '\t' : ' ').repeat((useTabs ? 1 : 2) * level);
  },

  print: function(styles, colors, comments, options, start) {

    var output = '';
    var level = options && options.level || 0;
    var variableSymbol = options &&
        options.language && options.language.search(/s[ac]ss/) > -1 ? '$' : '@';

    if (colors && colors.length && start) {
      if (!options || options.includeComments) {
        output += '// Color variables\n'
      }
      colors.forEach(function(color, index) {
        output += variableSymbol + 'var' + (index + 1) + ': ' + color + ';\n';
      });
      output += '\n';
    }

    for (var selector in styles) {

      var style = styles[selector];

      // Print the comments
      if (comments && comments.length) {
        var commentIndex = -1;
        for (var i = 0; i < comments.length; i++) {
          if (comments[i].index < style.index) {
            commentIndex = i;
          }
        }
        if (commentIndex > -1) {
          if (output.length > 0 && output.charAt(output.length - 1) !== '\n') {
            output += '\n';
          }
          output += this._indent(level, options) + '// ' +
              comments[commentIndex].text + '\n';
          comments.splice(commentIndex, 1);
        }
      }

      // Print the styles
      output += this._indent(level, options) + selector;
      if (!options || options.language !== 'sass') {
        output += ' {';
      }
      output += '\n';
      for (var property in style.rules) {

        output += this._indent(level + 1, options);
        output += property + ': ';

        if ((new RegExp(colors.join('|'), 'g')).test(style.rules[property])) {
          for (var i = colors.length - 1; i >= 0; i--) {
            var re = new RegExp(colors[i], 'g');
            style.rules[property] = style.rules[property].replace(re, variableSymbol + 'var' + (i + 1));
          }
        }
        output += style.rules[property];
        output += ';\n';
      }
      if (style.children) {
        output += this.print(style.children, colors, comments,
            Object.assign(options || {}, {level: level + 1}));
      }
      output += this._indent(level, options);
      if (!options || options.language !== 'sass') {
        output += '}';
      }
      output += '\n';

      if (!level) {
        output += '\n';
      }
    }

    return output;
  },

  parse: function(css, options) {

    // Options include...
    // language [string] Accepts 'less', 'sass', and 'scss' (default is 'less')
    // createVariables [bool] Whether or not color variables are created
    // includeComments [bool] Whether or not comments are included
    // useTabs [bool] If you prefer to use tabs rather than spaces

    var results = this.prepare(css);
    return this.print(results.styles,
        options && !options.createVariables ? null : results.colors,
        options && !options.includeComments ? null : results.comments,
        options,
        true);
  }
};

module.exports = fishsticss;
