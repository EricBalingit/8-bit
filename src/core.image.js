/*
	8-bit Image

	© 2016 Epistemex
	www.epistemex.com
	MIT License
*/

_8bit.Image = function(w, h, ctx) {

	var me = this,
		img = new Image;

	this.onload = null;
	this.onerror = null;
	this.bitmap = null;
	this.width = 0;
	this.height = 0;
	this.naturalWidth = 0;
	this.naturalHeight = 0;
	this.palette = ctx.palette;

	img.onload = function(e) {

		me.width = me.naturalWidth = w = w ? w : img.naturalWidth || img.width;
		me.height = me.naturalHeight = h = h ? h : img.naturalHeight || img.height;
		me.bitmap = _8bit.Image.convert(img, w, h, ctx);

		if (me.onload) (me.onload.bind(me))(e);
	};

	img.onerror = function(e) {
		if (me.onerror) (me.onerror.bind(me))(e);
	};

	img.onabort = function(e) {
		if (me.onabort) me.onabort(e);
	};

	Object.defineProperty(this, "src", {
		get: function() {return img.src},
		set: function(v) {
			img.src = v
		}
	});

	Object.defineProperty(this, "crossOrigin", {
		get: function() {return img.crossOrigin},
		set: function(v) {
			img.crossOrigin = v
		}
	});
};

_8bit.Image.convert = function(img, w, h, ctx8) {

	// todo optimize by working directly with buffer one iteration and with inline calculations

	var ctx = _8bit.utils.getContext(w, h),
		idata, buffer, buffer32, len,
		cols = [],
		ditherMode,
		x, y,
		p, yc, nc,
		dither,
		palette = ctx8.palette,
		mode = ctx8.imageSmoothingQuality,
		i = 0,
		funcs = [ditherOrdered, ditherSierra, ditherFloydSteinberg],
		bayer = [
			0.0176,0.1588,0.0530,0.1941,
			0.2294,0.0882,0.2647,0.1235,
			0.0706,0.2118,0.0353,0.1765,
			0.2824,0.1412,0.2471,0.1059];

	// low=no dithering, medium=sierra, high=floyd-steinberg
	ditherMode = ["low", "medium", "high"].indexOf(mode);

	ctx.drawImage(img, 0, 0, w, h);
	idata = ctx.getImageData(0, 0, w, h);
	buffer = idata.data;
	len = buffer.length;

	buffer32 = new Uint32Array(idata.data.buffer);

	if (!ctx8.imageSmoothingEnabled || ditherMode < 0) {

		while(i < len) {
			buffer32[i++] = palette.getNearestColor(new _8bit.Color(buffer32[i])).int32
		}
	}
	else {

		// convert pixels to Color classes
		for(y = 0; y < h; y++) {

			cols.push([]);

			for(x = 0, yc = cols[y]; x < w; x++) {
				p = y * w + x;
				yc.push(new _8bit.Color(buffer32[p]));
			}
		}

		dither = funcs[ditherMode];

		for(y = 0, p = 0; y < h; y++) {
			for(x = 0; x < w; x++) {
				nc = dither(cols, palette, x, y, w, h);
				buffer32[p++] = nc.int32;
			}
		}

	}

	function ditherFloydSteinberg(cols, palette, x, y, w, h) {

		var oc = cols[y][x],
			nc = palette.getNearestColor(oc),
			err = oc.sub(nc),
			xp1 = x + 1,
			y1 = y + 1,
			xm1, colY;

		if (xp1 < w)
			cols[y][xp1] = cols[y][xp1].add(err.mul(0.4375)); 		// 7/16

		if (y1 < h) {
			xm1 = x - 1;
			colY = cols[y1];
			colY[x] = colY[x].add(err.mul(0.3125));					// 5/16

			if (xm1 >= 0)
				colY[xm1] = colY[xm1].add(err.mul(0.1875));			// 3/16

			if (xp1 < w)
				colY[xp1] = colY[xp1].add(err.mul(0.0625));			// 1/16
		}

		return nc
	}

	function ditherSierra(cols, palette, x, y, w, h) {

		var oc = cols[y][x],
			nc = palette.getNearestColor(oc),
			err = oc.sub(nc),
			xp1 = x + 1,
			xm1 = x - 1,
			y1 = y + 1,
			colY = cols[y1];

		if (xp1 < w)
			cols[y][xp1] = cols[y][xp1].add(err.mul(0.5));			// /2

		if (y1 < h) {
			colY[x] = colY[x].add(err.mul(0.25));					// /4

			if (xm1 >= 0)
				colY[xm1] = colY[xm1].add(err.mul(0.25));			// /4
		}

		return nc
	}

	function ditherOrdered(cols, palette, x, y) {

		var oc = cols[y][x],
			t = ((y % 4) << 2) + (x % 4),
			dither = bayer[t];

		return palette.getNearestColor(
			new _8bit.Color(
				oc.r + (oc.r * dither & 0xff),
				oc.g + (oc.g * dither & 0xff),
				oc.b + (oc.b * dither & 0xff)
			))
	}

	return idata
};