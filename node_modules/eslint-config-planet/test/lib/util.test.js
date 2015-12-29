var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var util = require('../../lib/util');

lab.experiment('util', function() {

  lab.experiment('merge', function() {

    lab.test('copies properties from one object to another', function(done) {
      var src = {
        foo: 'bar',
        num: 42
      };
      var dest = {
        bam: 'baz'
      };

      util.merge(dest, src);
      expect(dest).to.deep.equal({
        foo: 'bar',
        num: 42,
        bam: 'baz'
      });

      done();
    });

    lab.test('returns the dest object', function(done) {
      var src = {};
      var dest = {};

      var merged = util.merge(dest, src);
      expect(merged).to.equal(dest);

      done();
    });

    lab.test('recursively merges', function(done) {
      var src = {
        foo: 'bar',
        obj: {
          bam: 'baz'
        }
      };

      var merged = util.merge({}, src);
      expect(merged).to.deep.equal(src);

      done();
    });

    lab.test('selectively merges', function(done) {
      var src = {
        foo: 'bar',
        obj: {
          bam: 'baz'
        }
      };
      var dest = {
        obj: {
          num: 42
        }
      };

      util.merge(dest, src);
      expect(dest).to.deep.equal({
        foo: 'bar',
        obj: {
          num: 42,
          bam: 'baz'
        }
      });

      done();
    });

    lab.test('concatenates arrays', function(done) {
      var src = {
        foo: ['one', 'two']
      };
      var dest = {
        foo: ['bam']
      };
      util.merge(dest, src);
      expect(dest.foo).to.deep.equal(['bam', 'one', 'two']);
      done();
    });

    lab.test('copies array if dest contains none', function(done) {
      var src = {
        foo: ['one', 'two']
      };
      var dest = {
      };
      util.merge(dest, src);
      expect(dest.foo).to.deep.equal(['one', 'two']);
      done();
    });

    lab.test('works with multiple sources', function(done) {
      var src1 = {
        foo: 'bar1',
        num1: 42
      };
      var src2 = {
        foo: 'bar2',
        num2: 42
      };

      var merged = util.merge({}, src1, src2);
      expect(merged).to.deep.equal({
        foo: 'bar2',
        num1: 42,
        num2: 42
      });

      expect(src1).to.deep.equal({
        foo: 'bar1',
        num1: 42
      });

      expect(src2).to.deep.equal({
        foo: 'bar2',
        num2: 42
      });

      done();
    });

  });

});
