module.exports = FileBackend;

var fs = require('fs');
var url = require('url');
var path = require('path');
var qs = require('querystring');
var mkdirp = require('mkdirp');

function FileBackend(uri, callback) {
    if (typeof uri === 'string') uri = url.parse(uri, true);
    else if (typeof uri.query === 'string') uri.query = qs.parse(uri.query);
    uri.query = uri.query || {};

    if (!uri.pathname) {
        callback(new Error('Invalid directory ' + url.format(uri)));
        return;
    }

    if (uri.hostname === '.' || uri.hostname == '..') {
        uri.pathname = uri.hostname + uri.pathname;
        delete uri.hostname;
        delete uri.host;
    }

    this.basepath = uri.pathname;
    this.filetype = uri.query.filetype || 'png';
    this.safe = uri.query.safe === 'true';

    mkdirp(this.basepath, function(err) {
        callback(err, this);
    }.bind(this));
    return undefined;
}

FileBackend.registerProtocols = function(tilelive) {
    tilelive.protocols['file:'] = FileBackend;
};

FileBackend.prototype.getPath = function(z, x, y, ext) {
    if (this.safe) {
        var col = String("000000" + x).slice(String(x).length);
        var row = String("000000" + y).slice(String(y).length);

        return path.join(this.basepath, String(z), col.slice(0, 3), col.slice(3, 6), row.slice(0, 3), row.slice(3, 6) + '.' + ext);
    } else {
        return path.join(this.basepath, String(z), String(x), String(y) + '.' + ext);
    }
};

FileBackend.prototype.getTile = function(z, x, y, callback) {
    fs.readFile(this.getPath(z, x, y, this.filetype), function(err, data) {
        if (err && err.code === 'ENOENT') return callback(new Error('Tile does not exist'));
        if (err) return callback(err);
        callback(null, data, {
            // headers
        });
    });
};

FileBackend.prototype.getGrid = function(z, x, y, callback) {
    fs.readFile(this.getPath(z, x, y, 'json'), function(err, data) {
        if (err && err.code === 'ENOENT') return callback(new Error('Grid does not exist'));
        if (err) return callback(err);
        callback(null, data, {
            // headers
        });
    });
};

FileBackend.prototype.getInfo = function(callback) {
    fs.readFile(path.join(this.basepath, 'metadata.json'), function(err, data) {
        if (err) return callback(err);
        try {
            data = JSON.parse(data);
        } catch (err) {
            return callback(err);
        }
        callback(null, data);
    });
};

FileBackend.prototype.startWriting = function(callback) {
    callback(null);
};

FileBackend.prototype.stopWriting = function(callback) {
    callback(null);
};

FileBackend.prototype.putInfo = function(info, callback) {
    var data = JSON.stringify(info);
    fs.writeFile(path.join(this.basepath, 'metadata.json'), data, callback);
};

FileBackend.prototype.putTile = function(z, x, y, tile, callback) {
    var filename = this.getPath(z, x, y, this.filetype);
    mkdirp(path.dirname(filename), function(err) {
        if (err) return callback(err);
        fs.writeFile(filename, tile, callback);
    });
};

FileBackend.prototype.putGrid = function(z, x, y, grid, callback) {
    var data = JSON.stringify(grid);
    var filename = this.getPath(z, x, y, 'json');
    mkdirp(path.dirname(filename), function(err) {
        fs.writeFile(filename, data, callback);
    });
};

FileBackend.prototype.close = function(callback) {
    callback(null);
};
