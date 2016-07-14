/*
	8-bit Pattern style object
	© 2016 Epistemex
	www.epistemex.com
*/

_8bit.Pattern = function(img, repeat, ctx) {

	if (typeof "repeat" === "undefined")
		throw "Type Mismatch: repeat cannot be undefined";

	var	funcs = [getPixelRepeat, getPixelRepeatX, getPixelRepeatY, getPixelNoRepeat],
		funcsM = [getPixelRepeatM, getPixelRepeatXM, getPixelRepeatYM, getPixelNoRepeatM],
		funcsTbl,
		index = ["repeat", "repeat-x", "repeat-y", "no-repeat"].indexOf(repeat),
		palette = ctx.palette,
		lm = ctx.getTransform().inverse(),
		w, h,
		idata, buffer;

	//todo handle Blob, ImageData, ImageBitmap types

	if (img instanceof HTMLImageElement) {
		w = img.naturalWidth || img.width;
		h = img.naturalHeight || img.height;
		idata = img.__8bit || _8bit.Image.convert(img, w, h, ctx);
		//todo auto GC cache after 10s or so using closure and timer
		img.__8bit = idata;
	}
	else if (img instanceof HTMLVideoElement) {
		w = img.naturalWidth || img.width;
		h = img.naturalHeight || img.height;
		idata = _8bit.Image.convert(img, w, h, palette, ctx);
	}
	else if (img instanceof _8bit.Image) {
		w = img.width;
		h = img.height;
		idata = img.bitmap
	}

	buffer = new Uint32Array(idata.data.buffer);

	this.setTransform = function(m) {
		lm.reset();
		lm.multiply(m.inverse());
		lm.multiply(ctx.getTransform().inverse());

		funcsTbl = lm.isIdentity() ? funcs : funcsM;
		this._getPixel = funcsTbl[index < 0 ? 0 : index];

		return this
	};

	funcsTbl = lm.isIdentity() ? funcs : funcsM;
	this._getPixel = funcsTbl[index < 0 ? 0 : index];

	function getPixelRepeat(x, y) {
		x = x % w;
		y = y % h;
		return buffer[y * w + x]
	}

	function getPixelRepeatX(x, y) {
		x = x % w;
		return (y >= 0 && y < h) ? buffer[y * w + x] : 0
	}

	function getPixelRepeatY(x, y) {
		y = y % h;
		return (x >= 0 && x < w) ? buffer[y * w + x] : 0
	}

	function getPixelNoRepeat(x, y) {
		return (x >= 0 && x < w && y >= 0 && y < h) ? buffer[y * w + x] : 0
	}

	function getPixelRepeatM(x, y) {
		var p = lm.applyToPoint(x, y);
		x = p.x % w;
		y = p.y % h;
		if (x < 0) x += w;
		if (y < 0) y += h;
		return buffer[y * w + x]
	}

	function getPixelRepeatXM(x, y) {
		var p = lm.applyToPoint(x, y);
		x = p.x % w;
		y = p.y;
		if (x < 0) x += w;
		return (y >= 0 && y < h) ? buffer[y * w + x] : 0
	}

	function getPixelRepeatYM(x, y) {
		var p = lm.applyToPoint(x, y);
		x = p.x;
		y = p.y % h;
		if (y < 0) y += h;
		return (x >= 0 && x < w) ? buffer[y * w + x] : 0
	}

	function getPixelNoRepeatM(x, y) {
		var p = lm.applyToPoint(x, y);
		x = p.x;
		y = p.y;
		return (x >= 0 && x < w && y >= 0 && y < h) ? buffer[y * w + x] : 0
	}

};