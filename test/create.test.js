var file = require('..');
var assert = require('assert');
var crypto = require('crypto');
var fs = require('fs');

function md5(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}

describe('creating a file-based tilesource', function() {
    it('should retrieve a tile correctly', function(done) {
        new file('./test/fixtures/readonly', function(err, source) {
            if (err) return done(err);
            source.getTile(0, 0, 0, function(err, tile) {
                if (err) return done(err);
                assert.equal(md5(tile), 'e071213b7ca2f1c10ee8944300f461bd');
                done(null);
            });

        });
    });
       
    it('should have headers', function(done) {
        new file('./test/fixtures/readonly', function(err, source) {
            if (err) return done(err);
            var filepath = source.getPath(0, 0, 0, 'png');
            fs.stat(filepath, function(err, stats) {
                if (err) {
                    return done(err);            
                }  
                source.getTile(0, 0, 0, function(err, tile, headers) {
                    if (err) return done(err);
                    assert.equal(md5(tile), 'e071213b7ca2f1c10ee8944300f461bd');
                    assert.equal(headers['Content-Type'], 'image/png');
                    assert.equal(headers['Last-Modified'], new Date(stats.mtime).toUTCString());
                    assert.equal(headers['ETag'],  tile.length + '-' + Number(stats.mtime));
                    done(null);
                });
            });
        });
    });
    
    describe('in safe mode', function() {
        it('should retrieve a tile correctly', function(done) {
            new file('./test/fixtures/safe?safe=true', function(err, source) {
                if (err) return done(err);
                source.getTile(0, 0, 0, function(err, tile) {
                    if (err) return done(err);
                    assert.equal(md5(tile), 'e071213b7ca2f1c10ee8944300f461bd');
                    done(null);
                });
            });
        });
    });
});
