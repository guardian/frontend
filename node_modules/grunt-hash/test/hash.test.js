
var assert = require('assert');
var fs = require('fs');

suite('grunt-hash', function() {

  suite('php', function() {

    test('assets.php created', function() {
      assert.ok(fs.existsSync('out/assets.php'));
      assert.equal(fs.readFileSync('out/assets.php', 'utf8'), fs.readFileSync('test/fixtures/assets.php', 'utf8'));
    });

    test('files created', function() {
      assert.ok(fs.existsSync('out/dist/php/test1.b93fd451.js'));
      assert.ok(fs.existsSync('out/dist/php/test2.2870d71a.js'));
    });

  });

  suite('json', function() {

    test('assets.json created', function() {
      assert.ok(fs.existsSync('out/assets.json'));
      assert.equal(fs.readFileSync('out/assets.json', 'utf8'), fs.readFileSync('test/fixtures/assets.json', 'utf8'));
    });

    test('files created', function() {
      assert.ok(fs.existsSync('out/dist/json/test1.b93fd451.js'));
      assert.ok(fs.existsSync('out/dist/json/test2.2870d71a.js'));
    });

  });

  suite('basePath', function() {

    test('path.json created', function() {
      assert.ok(fs.existsSync('out/path.json'));
      assert.equal(fs.readFileSync('out/path.json', 'utf8'), fs.readFileSync('test/fixtures/path.json', 'utf8'));
    });

    test('files created', function() {
      assert.ok(fs.existsSync('out/dist/path/test1.b93fd451.js'));
      assert.ok(fs.existsSync('out/dist/path/test2.2870d71a.js'));
      assert.ok(fs.existsSync('out/dist/path/test3.d8cfe155.js'));
    });
  });

  suite('flatten', function() {

    test('flatten.json created', function() {
      assert.ok(fs.existsSync('out/flatten.json'));
      assert.equal(fs.readFileSync('out/flatten.json', 'utf8'), fs.readFileSync('test/fixtures/flatten.json', 'utf8'));
    });

    test('files created', function() {
      assert.ok(fs.existsSync('out/dist/flatten/test1.b93fd451.js'));
      assert.ok(fs.existsSync('out/dist/flatten/test2.2870d71a.js'));
      assert.ok(fs.existsSync('out/dist/flatten/test3.d8cfe155.js'));
    });
    
  });

  suite('no dest', function() {

    test('no_dest.json created', function() {
      assert.ok(fs.existsSync('out/no_dest.json'));
      assert.equal(fs.readFileSync('out/no_dest.json', 'utf8'), fs.readFileSync('test/fixtures/no_dest.json', 'utf8'));
    });

    test('files created', function() {
      assert.ok(fs.existsSync('examples/test1.b93fd451.js'));
    });
    
  });
});
