
// TODO: prevent capturing spaces at the end of a match so we don't use trim() everywhere
var patterns = {
  selector: /([_a-zA-Z0-9-:,#:.\[\]="\s]?[_a-zA-Z0-9-*:>+,#:.\(\)\[\]=|~^$"\s]*)\s*\{\s*([\S\s]*?)\s*\}/gm,
  rule: /(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)\s*:\s*([_a-zA-Z0-9-%#'",.\(\)\s]+);*/gm,
  comment: /\/\*[\S\s]*\*\//gm
};

var Fishsticss = function(options) {
  return {
    scrub: function(css) {

      var selectors = {};
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

        if (selectors[selector]) {
          selectors[selector].rules = Object.assign(selectors[selector].rules, rules);
        } else {
          selectors[selector] = {rules: rules};
        }

        match = patterns.selector.exec(css);
      }
      return selectors;
    }
  };
};

global.Fishsticss = Fishsticss;
