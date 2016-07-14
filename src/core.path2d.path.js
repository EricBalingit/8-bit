/*
	8-bit Path object used internally in Path2D
	© 2016 Epistemex
	www.epistemex.com
*/

/**
 * Local Path object to hold points for each sub-path
 * @constructor
 * @private
 */
_8bit.Path2D.Path = function(path) {
	this.points = path ? path.concat() : [];
	this.isClosed = false;
};

_8bit.Path2D.Path.prototype = {
	add: function(x, y) {this.points.push(x, y)},   // NOTE: rounded to integer happens via the matrix !
	concat: function(a) {this.points = this.points.concat(a)}
};

