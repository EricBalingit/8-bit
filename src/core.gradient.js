/*
	8-bit Gradient style object
	© 2016 Epistemex
	www.epistemex.com
*/
_8bit.Gradient = function(type, options, ctx8) {

	var w = ctx8.width,
		h = ctx8.height,
		c = _8bit.utils.getContext(1, 1),
		gradient, m, idata, buffer, isFirst = true;

	gradient = type === "l" ?
			  c.createLinearGradient(options.x1, options.y1, options.x2, options.y2) :
			  c.createRadialGradient(options.x1, options.y1, options.r1, options.x2, options.x2, options.r2);

	this._sm = function() {
		this._getPixel = m.isIdentity() ? setPixel : setPixelM
	};

	this._getPixel = null;

	function setPixelM(x, y) {
		var p = m.applyToPoint(x, y);
		x = p.x;
		y = p.y;
		return (x >= 0 && x < w && y >= 0 && y < h) ? buffer[y * w + x] : 0
	}

	function setPixel(x, y) {
		return (x >= 0 && x < w && y >= 0 && y < h) ? buffer[y * w + x] : 0
	}

	this._generate = function(ctx8) {

		var tm = ctx8.getTransform().inverse();

		if (!isFirst && tm.isEqual(m)) return;

		m = tm;
		isFirst = false;

		// create a normal gradient
		var	ctx = _8bit.utils.getContext(w, h);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, w, h);

		// convert to dithered bitmap
		idata = _8bit.Image.convert(ctx.canvas, w, h, ctx8);
		buffer = new Uint32Array(idata.data.buffer);

		//todo force opaque pixels

		this._sm()
	};

	this.addColorStop = function(t, color) {
		gradient.addColorStop(t, color);
		return this
	};
};
