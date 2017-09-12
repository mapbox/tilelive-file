# tilelive-file

[![Build Status](https://secure.travis-ci.org/mapbox/tilelive-file.png)](http://travis-ci.org/mapbox/tilelive-file)

Reads/writes tiles and grids from/to the filesystem.

This module is intended to be used with [tilelive.js](https://github.com/mapbox/tilelive.js).

## Options

### filetype

Specify the extension of the tiles: `file://path/to/tiles?filetype=mvt`

### safe

Read / write tiles with the [TileStache safe layout](http://tilestache.org/doc/#disk-cache): `file://path/to/tiles?safe=true`
