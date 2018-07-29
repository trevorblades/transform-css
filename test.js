const parse = require('./');

const css = `
  /* Comments ain't no thang! */
  #id {
    width: 100%;
    color: rgb(0, 0,15);
  }
  
  #id {
    height: 100%;
  }

  #id .class, #id .other .hehe {
    height: 100%;
    border: 1px solid #ff0000;
  }

  #id .class {
    color: red;
  }
  
  /* A comment before a child class */
  #id  .class  .child-class {
    margin-top: 24px;
  }
  
  #id .class .child-class2.lol {
    width: 250px;
  }

  /* A comment before a sub class */
  #id .class.sub-class {
    color: #ff0000;
  }

  .another.random-thing {
    color: green;
  }
`;

test('parses css', () => {
  const actual = parse(css);
  const expected = `#id {
  width: 100%;
  color: rgb(0, 0,15);
  height: 100%;

  .class, .other .hehe {
    height: 100%;
    border: 1px solid #ff0000;
  }

  .class {
    color: red;

    .child-class2.lol {
      width: 250px;
    }

    .child-class {
      margin-top: 24px;
    }

    &.sub-class {
      color: #ff0000;
    }
  }
}

.another.random-thing {
  color: green;
}
`;
  expect(actual).toBe(expected);
});
