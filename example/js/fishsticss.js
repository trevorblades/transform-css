/* 
	<>< Fishsticss.js - http://www.fishsticss.com
	Made by Trevor Blades in Vancouver, BC
*/

/* Dependencies first */

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement , fromIndex) {
    var i,
        pivot = (fromIndex) ? fromIndex : 0,
        length;

    if (!this) {
      throw new TypeError();
    }

    length = this.length;

    if (length === 0 || pivot >= length) {
      return -1;
    }

    if (pivot < 0) {
      pivot = length - Math.abs(pivot);
    }

    for (i = pivot; i < length; i++) {
      if (this[i] === searchElement) {
        return i;
      }
    }
    return -1;
  };
}

var arrayUnique = function(array) {
	return array.filter(function (a, b, c) {
		return c.indexOf(a) === b;
	});
};

/* Now the class */

var Fishsticss = function() {
	
	/* Regex */

	this.patterns = {
		selector: /([_a-zA-Z0-9-:,#:.\[\]="\s]?[_a-zA-Z0-9-*:>+,#:.\(\)\[\]=|~^$"\s]*)\s*\{\s*([\S\s]*?)\s*\}/gm,
		rule: /(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)\s*:\s*([_a-zA-Z0-9-%#'",.\(\)\s]+);*/gm,
		comment: /\/\*[\S\s]*\*\//gm
	};

	/* Scrub-a-dub-dub */

	this.scrub = function(css, settings) {
	
		/* [css] is a string of CSS code */
		/* [settings] is an object consisting a few options: 
			'comments': boolean,
			'variables': boolean,
			'convert': choice of 'less', 'sass', 'scss', or 'false' */
		
		var scrape = function(piece, set) {
			var found = false;
			if (settings.convert !== false) {
				for (var i = 0; i < set.length; i++) {
					var fits = [];
					if (piece.selector.length >= set[i].selector.length) { /* For body, #nav {} body #div, #nav #div {} instances */
						for (var p = 0; p < piece.selector.length; p++) {
							for (var s = 0; s < set[i].selector.length; s++) {
								if (piece.selector[p] !== set[i].selector[s] && piece.selector[p].indexOf(set[i].selector[s]) === 0) {
									var first = piece.selector[p].substr(set[i].selector[s].length).charAt(0).toUpperCase();
									if (!first.match(/^[A-Z]/)) {
										fits.push([p,s]);
									}
								}
							}
						}
					}
					if (fits.length === piece.selector.length) {
						found = true;
						for (var f = 0; f < piece.selector.length; f++) {
							piece.selector[f] = piece.selector[f].substr(set[i].selector[fits[f][1]].length);
							if (piece.selector[f].charAt(0) === ' ') {
								piece.selector[f] = piece.selector[f].trim();
							}else{
								piece.selector[f] = '&' + piece.selector[f].trim();
							}
						}
						piece.selector = arrayUnique(piece.selector);
						scrape(piece, set[i].descendants);
					}
				}
			}
			if (!found) {
				set.push(piece);
			}
		};
	
		/* Styles */
		var styles = [],
			variables = [],
			m;
		
		while (m = this.patterns.selector.exec(css)) {
			var style = {
					selector: m[1].replace(/\n+/gm, ' ').replace(/\s*,+\s*/gm, ',').replace(/,+$/gm, '').trim().split(','),
					rules: [],
					descendants: [],
					index: m.index
				},
				n;
			while(n = this.patterns.rule.exec(m[2])) {
				if (settings.variables === true) {
					var v;
					if (v = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.exec(n[2])) {
						if (variables.indexOf(v[1]) === -1) {
							variables.push(v[1]);
						}
					}
				}
				style.rules.push({
					property: n[1],
					value: n[2]
				});
			}
			scrape(style, styles);
		}
	
		/* Comments */
		var comments = [],
			c;
	
		if (settings.comments === true) {
			while (c = this.patterns.comment.exec(css)) {
				comments.push({
					content: c[0],
					index: c.index
				});
			}
		}
	
		/* Write pretty styles */
		var less = '',
			level = 0,
			semi = settings.convert === 'sass' ? '' : ';',
			brace = settings.convert === 'sass' ? ['',''] : ['{','}'];
		
		var tabs = function(l) {
			var tabs = '';
			for (var i = 0; i < l; i++) {
				tabs += '\t';
			}
			return tabs;
		};
		
		var rinse = function(styles, l) {
			for (var s in styles) {
				if (comments.length) {
					if (comments[0].index < styles[s].index) {
						if (less.length > 0 && less.charAt(less.length-1) !== '\n') {
							less += '\n';
						}
						less += tabs(l) + comments[0].content + '\n';
						if (l === 0) {
							less += '\n';
						}
						comments.splice(0,1);
					}
				}
				less += tabs(l) + styles[s].selector.join(', ') + ' ' + brace[0] + '\n';
				var rules = styles[s].rules;
				for (var r in rules) {
					for (var v in variables) {
						if (rules[r].value.indexOf(variables[v]) > -1) {
							rules[r].value = rules[r].value.replace('#' + variables[v], '@var' + (parseInt(v)+1));
						}
					}
					less += tabs(l) + '\t' + rules[r].property + ': ' + rules[r].value + semi + '\n';
				}
				if (styles[s].descendants.length > -1) {
					rinse(styles[s].descendants, l+1);
				}
				less += tabs(l) + brace[1] + '\n';
			}
		};
	
		if (styles.length) {
			if (settings.convert !== false && settings.variables === true && variables.length > 0) {
				var prefix = settings.convert === 'less' ? '@' : '$';
				for (var k in variables) {
					var cname = 'var',
						hexcode = variables[k];
				
					if (hexcode.length === 3) {
						hexcode = hexcode.charAt(0)+hexcode.charAt(0)+hexcode.charAt(1)+hexcode.charAt(1)+hexcode.charAt(2)+hexcode.charAt(2);
					}
				
					/* var colour = {
						'red': hexcode.substr(0,2),
						'green': hexcode.substr(2,4),
						'blue': hexcode.substr(4,6)
					}; */
					
					less += prefix + cname + (parseInt(k)+1) + ': #' + hexcode + semi + '\n';
				}
				less += '\n';
			}
			rinse(styles, level);
		}
	
		return less;
	
	};
	
};