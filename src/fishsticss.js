var Color = require('color');

// TODO: prevent capturing spaces at the end of a match so we don't need to use trim() everywhere
var SELECTOR_PATTERN = /(.+?){\s*([\S\s]*?)\s*\}/gm;
var COMMENT_PATTERN = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gm;
var COLOR_PATTERN = /(?:#((?:[0-9a-f]{3}){1,2})|((?:rgb|hsl)a?)\((25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*,\s*(25[0-5]|2[0-4]\d|1\d{1,2}|\d\d?)\s*(?:,\s*(1(?:\.0)?|(?:0|0?\.\d\d?)))?\))/gim;
var STYLE_SPLIT_PATTERN = /((?:[^;"']|"[^"]*"|'[^']*')+)/gm;
var RULE_SPLIT_PATTERN = /((?:[^:"']|"[^"]*"|'[^']*')+)/gm;
var MEDIA_PATTERN = /\@media[^\{]*\{([^\{\}]*\{[^\}\{]*\})*[^\}]*\}/gm;
var FONTFACE_PATTERN = /\@fontface[^\{]*\{([^\{\}]*\{[^\}\{]*\})*[^\}]*\}/gm;

var fishsticss = {

  _scrape: function(css , commentMap) {

    var styles = {};
    var colors = {};

    // TODO: use css.match(SELECTOR_PATTERN) instead
    var match = SELECTOR_PATTERN.exec(css);
    while (match) {

      if (commentMap[match.index] == undefined){
    	
	      var selector = match[1].trim();
	
	      //remove any comments 
	      var cssStyles = match[2].trim();
	      var commentFiltered = cssStyles.replace(COMMENT_PATTERN, '\n');
	
	      // Split apart the style properties
	      // TODO: use a fat arrow function for this filter?
	      var rules = commentFiltered.split(STYLE_SPLIT_PATTERN).filter(function(rule) {
	        return rule;
	      }).reduce(function(a, b) {
	
	        var itt = 1;
	        var rule = b.split(RULE_SPLIT_PATTERN).filter(function(rule) {
	          if (itt++ %2 == 0){
	            return rule;
	          }
	          return '';
	        });
	        if (rule.length > 1) {
	
	          var value = rule[1].trim();
	
	          // Check if the value is a color (hex, rgb, or hsl)
	          var colorMatch = COLOR_PATTERN.exec(value);
	          if (colorMatch) {
	
	            // Format the color appropriately
	            // TODO: make color formatting optional
	            var color = new Color(colorMatch[0]);
	            var colorString = color.alpha() === 1 ?
	                color.hexString().toLowerCase() : color.rgbString();
	
	            // Increment count for the color
	            if (!colors[colorString]) {
	              colors[colorString] = 0;
	            }
	            colors[colorString] += 1;
	            value = value.replace(colorMatch[0], colorString);
	          }
	
	          a[rule[0].trim()] = value;
	        }
	        return a;
	      }, {});
	
	      //store the comments
	      var internalComments = [];
	      var commentMatch = COMMENT_PATTERN.exec(cssStyles);
	
	      while (commentMatch) {
	        internalComments.push(commentMatch[0].trim());
	        commentMatch = COMMENT_PATTERN.exec(cssStyles);
	      }
	
	      // Assign styles to the selector or define a new selector
	      if (styles[selector]) {
	        styles[selector].rules = Object.assign(styles[selector].rules, rules);
	      } else {
	        styles[selector] = {
	          index: match.index,
	          rules: rules,
	          internalComments:internalComments
	        };
	      }
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
  _prepareComments: function(css){
    //Rebuild the comment map and comment data
    var comments = [];
    var commentMap = new Array(css.length);
    var match = COMMENT_PATTERN.exec(css);
    while (match) {
      //each part of the comment is marked in the matrix
      for(var i=match.index;i<match[0].length;i++){
    	  commentMap[i]=true;
      }
      comments.push({
        index: match.index,
        text: match[0].trim()
      });
      match = COMMENT_PATTERN.exec(css);
    }
    
    return {
    	comments:comments,
    	commentMap:commentMap
    }
  },
  _processColors: function(colors , sourceColors){
    // Create array of colors that occur more than once
    for (var color in sourceColors) {
      if (sourceColors[color] > 0) {
    	  if (colors.indexOf(color)<0){
    		  colors.push(color);
    	  }
      }
    }
    return colors;
  },
  prepare: function(css) {
    // Get the comments
	var commentData = this._prepareComments(css);
    
    var mediaBlocks = [];
    //Extract the media and font 
    var match = MEDIA_PATTERN.exec(css);
    while (match) {
    	if (commentData.commentMap[match.index] == undefined){
    		var matchedMediaQuery = match[0].trim();
    		var matchedCss = matchedMediaQuery.slice(matchedMediaQuery.indexOf("{")).trim('}');
    		//Not in a comment
    		var mediaScrapings = this._scrape(matchedCss ,[]);
    		mediaBlocks.push({
    			mediaQuery : matchedMediaQuery.slice(0, matchedMediaQuery.indexOf("{")),
    			scrapings:mediaScrapings,
    			styles:this._rinse(this._scrub(mediaScrapings.styles))
    		});
    		
    	}
    	match = MEDIA_PATTERN.exec(css);
    }
    
    //Remove the media queries
    var filteredCss = css.replace(MEDIA_PATTERN, '\n');

    //Re-assess the comments
    commentData = this._prepareComments(filteredCss);
    
    // Scrape the CSS for styles and colors
    var scrapings = this._scrape(filteredCss , commentData.commentMap);
    var styles = this._rinse(this._scrub(scrapings.styles));
    
    var colors = [];

    colors = this._processColors(colors , scrapings.colors);
    
    for (var media in mediaBlocks) {
    	colors = this._processColors(colors , mediaBlocks[media].scrapings.colors);
    }

    return {
      mediaBlocks : mediaBlocks,
      styles: styles,
      colors: colors,
      comments: commentData.comments
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
          output += this._indent(level, options) +
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

        var colorIndex = !colors ? -1 : colors.findIndex(function(color) {
          return style.rules[property].indexOf(color) > -1;
        });
        if (colorIndex > -1) {
          output += style.rules[property].replace(colors[colorIndex],
              variableSymbol + 'var' + (colorIndex + 1));
        } else {
          output += style.rules[property];
        }
        output += ';\n';
      }

      if (options === undefined || options.includeComments){
        for (var internalComment in style.internalComments) {
            output += style.internalComments[internalComment] + '\n';
        }
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
    var output =  this.print(results.styles,
        options && !options.createVariables ? null : results.colors,
        options && !options.includeComments ? null : results.comments,
        options,
        true);
    
    
    for (var media in results.mediaBlocks) {
    	output += results.mediaBlocks[media].mediaQuery 
    		+ '{\n'
    		+ this.print(results.mediaBlocks[media].styles,
    		       options && !options.createVariables ? null : results.colors,
    		       options && !options.includeComments ? null : results.mediaBlocks[media].comments,
    		       options,false)
    		+ '\n}\n';
    }
    
    return output;
  }
};

module.exports = fishsticss;
