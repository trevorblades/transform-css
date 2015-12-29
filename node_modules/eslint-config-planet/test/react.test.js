var lab = exports.lab = require('lab').script();
var expect = require('code').expect;

var react = require('../react');

lab.experiment('react', function() {

  lab.test('includes the react plugin', function(done) {
    var plugins = react.plugins;
    expect(plugins).to.be.an.array();
    expect(plugins).to.include('react');
    done();
  });

});
