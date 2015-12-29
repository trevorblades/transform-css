var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var index = require('../index');
var baseConfig = require('../config/base.json');

lab.experiment('index', function() {

  lab.test('exports the base config', function(done) {
    expect(index).to.deep.equal(baseConfig);
    done();
  });

});
