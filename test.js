const outdent = require('outdent');
const parse = require('.');

test('handles multiple levels of descendant selectors', () => {
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

  const actual = parse(css);
  const expected = outdent`
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
  `;

  expect(actual).toBe(expected);
});

describe('formats css with weird or inconsistent spacing', () => {
  test('differences in spacing among rules', () => {
    const css = `
      #id {width: 420px; color: green;}
      .another-class {
        margin-top: 4px;
      }
    `;

    const actual = parse(css);
    const expected = outdent`
      #id {
        width: 420px;
        color: green;
      }

      .another-class {
        margin-top: 4px;
      }
    `;

    expect(actual).toBe(expected);
  });

  test('extra space between selectors, declarations, and properties', () => {
    const css = `
      #id {
        position:   relative;
      }
      #id    .child-class {position:absolute;
        top: 24px;
      }
    `;

    const actual = parse(css);
    const expected = outdent`
      #id {
        position: relative;

        .child-class {
          position: absolute;
          top: 24px;
        }
      }
    `;

    expect(actual).toBe(expected);
  });

  test('extra whitespace before, after, and between rules', () => {
    const css = `


      #id {width: 420px; color: green;}


      #id p {
        color: grey;


      }


      .another-class {
        margin-top: 4px;
      }


    `;

    const actual = parse(css);
    const expected = outdent`
      #id {
        width: 420px;
        color: green;

        p {
          color: grey;
        }
      }

      .another-class {
        margin-top: 4px;
      }
    `;

    expect(actual).toBe(expected);
  });
});

test('does not nest selectors unless their parents have styles', () => {
  const css = `
    #id {
      width: 420px;
      color: green;
    }

    #id .child-class p:last-child {
      margin-bottom: 0;
    }
  `;

  const actual = parse(css);
  const expected = outdent`
    #id {
      width: 420px;
      color: green;

      .child-class p:last-child {
        margin-bottom: 0;
      }
    }
  `;

  expect(actual).toBe(expected);
});

describe('accepts different indentation options', () => {
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
  `;

  test('variable number of spaces', () => {
    const actual = parse(css, {spaces: 3});
    const expected = outdent`
      #id {
         width: 420px;
         color: green;

         .child-class {
            overflow: hidden;

            p {
               margin: 0 1em;
            }
         }
      }
    `;

    expect(actual).toBe(expected);
  });

  test('use tabs', () => {
    const actual = parse(css, {spaces: false});
    const expected = outdent`
      #id {
      \twidth: 420px;
      \tcolor: green;

      \t.child-class {
      \t\toverflow: hidden;

      \t\tp {
      \t\t\tmargin: 0 1em;
      \t\t}
      \t}
      }
    `;

    expect(actual).toBe(expected);
  });
});

test('omit brackets and semicolons', () => {
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
    `;

  const actual = parse(css, {omitBracketsAndSemicolons: true});
  const expected = outdent`
      #id
        width: 420px
        color: green

        .child-class
          overflow: hidden

          p
            margin: 0 1em
    `;

  expect(actual).toBe(expected);
});
