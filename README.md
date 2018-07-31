# transform-css

[![CircleCI](https://circleci.com/gh/trevorblades/transform-css.svg?style=shield)](https://circleci.com/gh/trevorblades/transform-css)

This library transforms CSS into beautifully formatted styles ready to use with a preprocessor like [LESS](http://lesscss.org/), [SASS](https://sass-lang.com/), or [Stylus](http://stylus-lang.com/). Check out a working example [here](http://transform-css.trevorblades.com).

## Installation

```
npm install transform-css
```

## Usage

### transformCss(css, options)

Takes a string of CSS as input and returns a string of LESS/SASS. Descendant selectors, subclasses, and pseudo-classes will be nested where it makes sense. Sets of rules will be spaced out for increased readability. Pass `options` as a second argument to customize the format of the returned styles.

```js
import transformCss from 'transform-css';

const css = `
  #id {
    width: 420px;
    color: green;
  }

  #id .child-class {
    overflow: hidden;
  }

  #id .child-class p {
    margin: 0 1em;
  }

  #id .child-class p:last-child {
    margin-bottom: 0;
  }
`;

transformCss(css);
```

This will produce the following output:

```less
#id {
  width: 420px;
  color: green;

  .child-class {
    overflow: hidden;

    p {
      margin: 0 1em;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
```

## Options

### `spaces`

By default, two spaces will be used as indentation for the transformed styles. Use the `spaces` option to change this behaviour.

Specify a number to control the number of spaces used, or `false` to use tabs.

### `omitBracketsAndSemicolons`

By default, `transform-css` will produce code that follows LESS or SCSS syntax, which use brackets to separate selectors from rule declarations and semicolons to separate declarations from one another.

```less
#container {
  height: 50px;
  color: red;

  .header {
    position: sticky;
    top: 24px;
  }
}
```

On the other hand, SASS and Stylus use newlines and tabs to separate stylesheet elements from one another. Set the `omitBracketsAndSemicolons` option to `true` to use this syntax.

```js
transformCss(css, {omitBracketsAndSemicolons: true})
```

```stylus
#container
  height: 50px
  color: red

  .header
    position: sticky
    top: 24px
```
