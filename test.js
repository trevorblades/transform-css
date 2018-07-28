const parse = require('./');

test('parses css', () => {
  const actual = parse(
    'body { font-size: 12px; } #thing p, li { line-height: 1.5; }'
  );
  const expected = 'foo1';
  expect(actual).toBe(expected);
});
