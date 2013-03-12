var assert = require('assert'),
    fs = require('fs');
var rimraf = require('rimraf');
var FileBackend = require('..');

describe('putting', function() {
    afterEach(function(done) {
        // clear up tmp files
        rimraf("./tmp", done);
    });

    describe('a tile', function() {
        it('should write a corresponding file', function(done) {
            new FileBackend('./tmp/sink?filetype=txt', function(err, sink) {
                if (err) return done(err);

                var tileData = '3/7/7';

                sink.putTile(3, 7, 7, tileData, function(err) {
                    if (err) return done(err);

                    fs.readFile('./tmp/sink/3/7/7.txt', function(err, data) {
                        if (err) return done(err);

                        assert.equal(tileData, data);
                        return done();
                    });
                });
            });
        });

        describe('in safe mode', function() {
            it('should write a corresponding file in nested directories', function(done) {
                new FileBackend('./tmp/sink?safe=true&filetype=txt', function(err, sink) {
                    if (err) return done(err);

                    var tileData = '3/7/7';

                    sink.putTile(3, 7, 7, tileData, function(err) {
                        if (err) return done(err);

                        fs.readFile('./tmp/sink/3/000/007/000/007.txt', function(err, data) {
                            if (err) return done(err);

                            assert.equal(tileData, data);
                            return done();
                        });
                    });
                });
            });
        });
    });

    describe('a grid', function() {
        it('should write a corresponding file', function(done) {
            new FileBackend('./tmp/sink', function(err, sink) {
                if (err) return done(err);

                var grid = { foo: "bar" };

                sink.putGrid(3, 7, 7, grid, function(err) {
                    if (err) return done(err);

                    fs.readFile('./tmp/sink/3/7/7.json', function(err, data) {
                        if (err) return done(err);

                        assert.equal(JSON.stringify(grid), data);
                        return done();
                    });
                });
            });
        });

        describe('in safe mode', function() {
            it('should write a corresponding file in nested directories', function(done) {
                new FileBackend('./tmp/sink?safe=true', function(err, sink) {
                    if (err) return done(err);

                var grid = { foo: "bar" };

                sink.putGrid(3, 7, 7, grid, function(err) {
                        if (err) return done(err);

                        fs.readFile('./tmp/sink/3/000/007/000/007.json', function(err, data) {
                            if (err) return done(err);

                            assert.equal(JSON.stringify(grid), data);
                            return done();
                        });
                    });
                });
            });
        });
    });
});
