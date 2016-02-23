
// TODO: prevent capturing spaces at the end of a match so we don't use trim() everywhere
var patterns = {
  selector: /(.+?){\s*([\S\s]*?)\s*\}/gm,
  rule: /(.+?):(.+?);*/gm,
  comment: /\/\*[\S\s]*\*\//gm
};

var Fishsticss = function(options) {
  return {
    scrub: function(css) {

      var styles = {};
      var match = patterns.selector.exec(css);
      while (match) {

        var selector = match[1].trim();

        // TODO: use a fat arrow function for this filter
        var rules = match[2].trim().split(';').filter(function(rule) {
          return rule;
        }).reduce(function(a, b) {
          var rule = b.split(':').filter(function(rule) {
            return rule;
          });
          a[rule[0].trim()] = rule[1].trim();
          return a;
        }, {});

        if (styles[selector]) {
          styles[selector].rules = Object.assign(styles[selector].rules, rules);
        } else {
          styles[selector] = {rules: rules};
        }

        match = patterns.selector.exec(css);
      }

      var selectors = Object.keys(styles);
      for (var key in styles) {
        var selectorIndex = selectors.findIndex(function(selector) {
          return key !== selector && key.indexOf(selector) > -1;
        });
        if (selectorIndex > -1) {
          var parentSelector = selectors[selectorIndex];
          if (key !== parentSelector) {
            if (!styles[parentSelector].children) {
              styles[parentSelector].children = {};
            }
            styles[parentSelector]
                .children[key.replace(parentSelector, '').trim()] = styles[key];
            delete styles[key];
          }
        }
      }

      return styles;
    }
  };
};

global.Fishsticss = Fishsticss;
