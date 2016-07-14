/*
	8-bit stack object
	© 2016 Epistemex
	www.epistemex.com
*/
_8bit.State = function(palette, src) {

	this.styles = [new _8bit.Style(palette, 1, false), new _8bit.Style(palette, 1, false), new _8bit.Style(palette, 0, false)];
	this.lineWidth = 1;
	this.lineJoin = "miter";
	this.lineCap = "butt";
	this.lineDashPattern = [];
	this.lineDashOffset = 0;
	this.miterLength = 10;
	this.matrix = new _8bit.Matrix();
	this.textBaseline = "baseline";
	this.textAlign = "start";
	this.direction = "LTR";
	this.font = "10px sans-serif";
	this.shadowOffsetX = 0;
	this.shadowOffsetY = 0;
	this.shadowBlur = 0;
	this.shadowColor = "#000";
	//this.globalAlpha = 1;
	this.globalCompositeOperation = "source-over";
	this.imageSmoothingEnabled = true;
	this.imageSmoothingQuality = "low";

	if (src) this.init(src)
};

_8bit.State.prototype = {

	init: function(src) {
		for(var k in src) {
			if (src.hasOwnProperty(k)) this[k] = src[k]
		}
	}

};