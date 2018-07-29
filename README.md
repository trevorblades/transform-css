# transform-css

[![CircleCI](https://circleci.com/gh/trevorblades/transform-css.svg?style=shield)](https://circleci.com/gh/trevorblades/transform-css)

Transforms CSS into beautifully formatted styles ready to use with a preprocessor like [LESS](http://lesscss.org/), [SASS](https://sass-lang.com/), or [Stylus](http://stylus-lang.com/).

## Installation

```
npm install transform-css
```

## Usage

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

In this example, `transformCss(css)` will produce the following output:

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
