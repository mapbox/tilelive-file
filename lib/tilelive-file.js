module.exports = File;

var fs = require('fs');
var url = require('url');
var path = require('path');
var qs = require('querystring');
var mkdirp = require('mkdirp');

function File(uri, callback) {
    if (typeof uri === 'string') uri = url.parse(uri, true);
    else if (typeof uri.query === 'string') uri.query = qs.parse(uri.query);

    if (!uri.pathname) {
        callback(new Error('Invalid directory ' + url.format(uri)));
        return;
    }

    this.basepath = uri.pathname;
    this.filetype = uri.query.filetype || 'png';

    callback(null, this);
    return undefined;
}

File.registerProtocols = function(tilelive) {
    tilelive.protocols['file:'] = File;
};

File.prototype.getTile = function(z, x, y, callback) {
    fs.readFile(path.join(this.basepath, String(z), String(x), String(y) + '.' + this.filetype), function(err, data) {
        if (err && err.code === 'ENOENT') return callback(new Error('Tile does not exist'));
        if (err) return callback(err);
        callback(null, data, {
            // headers
        });
    });
};

File.prototype.getGrid = function(z, x, y, callback) {
    fs.readFile(path.join(this.basepath, String(z), String(x), String(y) + '.json'), function(err, data) {
        if (err && err.code === 'ENOENT') return callback(new Error('Grid does not exist'));
        if (err) return callback(err);
        callback(null, data, {
            // headers
        });
    });
};

File.prototype.getInfo = function(callback) {
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

File.prototype.startWriting = function(callback) {
    callback(null);
};

File.prototype.stopWriting = function(callback) {
    callback(null);
};

File.prototype.putInfo = function(info, callback) {
    var data = JSON.stringify(info);
    fs.writeFile(path.join(this.basepath, 'metadata.json'), data, callback);
};

File.prototype.putTile = function(z, x, y, tile, callback) {
    var dir = path.join(this.basepath, String(z), String(x));
    var type = this.filetype;
    mkdirp(dir, function(err) {
        if (err) return callback(err);
        fs.writeFile(path.join(dir, y + '.' + type), tile, callback);
    });
};

File.prototype.putGrid = function(z, x, y, grid, callback) {
    var data = JSON.stringify(grid);
    var dir = path.join(this.basepath, String(z), String(x));
    var type = this.filetype;
    mkdirp(dir, function(err) {
        fs.writeFile(path.join(dir, y + '.' + type), data, callback);
    });
};
