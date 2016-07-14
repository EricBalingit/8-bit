/*
	8-bit render module
	© 2016 Epistemex
	www.epistemex.com
*/

_8bit.Shaders.Pixelated = function(w, h, noAlpha) {

	var me = this;

	this.ctx = _8bit.utils.getContext(w, h, !!noAlpha);
	this.canvas = this.ctx.canvas;

	this.width = w;
	this.height = h;

	_8bit.utils.disableSmoothing(me.ctx)
};

_8bit.Shaders.Pixelated.prototype = {

	drawToCtx: function(ctx, w, h) {
		if (w && h)
			ctx.drawImage(this.canvas, 0, 0, w, h);
		else
			ctx.drawImage(this.canvas, 0, 0);
	},

	drawToRender: function(r, w, h) {
		this.drawToCtx(r.ctx, w, h)
	},

	clearRect: function(x, y, w, h, state) {

		// Since we don't use alpha, we will fill the background with
		// current "background" color. Apply transforms if any.

		if (state)
			state.matrix.applyToContext(this.ctx);

		this.ctx.fillStyle = state.styles[2].color.toStyle();
		this.ctx.fillRect(x, y, w, h);
		this.ctx.setTransform(1,0,0,1,0,0)
	},

	stroke: function(paths, state, ctx8) {

		// fCol is used only by fill() to force a solid color (not
		// pattern etc.). This outline is used to correct the rounding
		// errors from the two different approaches.

		var w = this.width,
			h = this.height,
			idata = this.ctx.createImageData(w, h),
			bmp = new Uint32Array(idata.data.buffer),
			style = state.styles[0],
			src, func,
			pts, p, i, t;

		switch(style.type) {

			case _8bit.Style.type.solid:	// solid
				src = style.style;
				func = setPixel;
				break;

			case _8bit.Style.type.pattern: // pattern
				src = style.original;
				func = setPixelPG;
				break;

			case _8bit.Style.type.gradient: // gradient
				src = style.original;
				func = setPixelPG;
				src._generate(ctx8);
				break;
		}

		for(i = 0; p = paths[i++];) {
			pts = p.points;
			if (pts.length > 1) {

				for(t = 2; t < pts.length; t += 2)
					line(pts[t-2], pts[t-1], pts[t], pts[t+1]);

				if (p.isClosed)
					line(pts[pts.length - 2], pts[pts.length - 1], pts[0], pts[1]);
			}
		}

		this.ctx.putImageData(idata, 0, 0);


		// helpers ---

		function setPixel(x, y) {
			if (x >= 0 && x < w && y >= 0 && y < h)
				bmp[y * w + x] = src;
		}

		function setPixelPG(x, y) {
			if (x >= 0 && x < w && y >= 0 && y < h)
				bmp[y * w + x] = src._getPixel(x, y);
		}

		function line(x1, y1, x2, y2) {

			var dlt, mul,
				sl = y2 - y1,
				ll = x2 - x1,
				yl = false,
				lls = ll >> 31,
				sls = sl >> 31,
				i;

			if ((sl ^ sls) - sls > (ll ^ lls) - lls) {
				sl ^= ll;
				ll ^= sl;
				sl ^= ll;
				yl = true
			}

			dlt = ll < 0 ? -1 : 1;
			mul = (ll === 0) ? sl : sl / ll;

			if (yl) {
				x1 += 0.5;
				for (i = 0; i !== ll; i += dlt)
					func((x1 + i * mul)|0, y1 + i)
			}
			else {
				y1 += 0.5;
				for (i = 0; i !== ll; i += dlt)
					func(x1 + i, (y1 + i * mul)|0)
			}
		}

	},

	fill: function(paths, state, ctx8, type) {

		var w = this.width,
			h = this.height,
			idata = this.ctx.createImageData(w, h),
			bmp = new Uint32Array(idata.data.buffer),
			style = state.styles[1],
			src, func,
			points, ranges, i;

		switch(style.type) {

			case _8bit.Style.type.solid:	// solid
				src = style.style;
				func = renderSolid;
				break;

			case _8bit.Style.type.pattern: // pattern
				src = style.original;
				func = renderPattGrad;
				break;

			case _8bit.Style.type.gradient: // gradient
				src = style.original;
				func = renderPattGrad;
				src._generate(ctx8);
				break;
		}

		for(i = 0; i < paths.length; i++) {
			points = paths[i].points;
			ranges = getLineRanges(points);
			func(ranges);
		}

		this.ctx.putImageData(idata, 0, 0);

		function renderSolid(ranges) {
			var i = 0, r;
			while(r = ranges[i++]) {
				for(var p, x = Math.max(0, r.x1), y = r.y, x2 = Math.min(w, r.x2); x < x2; x++) {
					p = y * w + x;
					bmp[p] ^= src
				}
			}
		}

		function renderPattGrad(ranges) {
			var i = 0, r, getPixel = src._getPixel;
			while(r = ranges[i++]) {
				for(var p, x = Math.max(0, r.x1), y = r.y, x2 = Math.min(w, r.x2); x < x2; x++) {
					p = y * w + x;
					bmp[p] = bmp[p] ? 0 : getPixel(x, y)
				}
			}
		}

		// get all ranges/segments
		function getLineRanges() {

			var	len = points.length,
				ranges = [],
				pts, pt, y, t;

			for(y = 0.25; y < h; y++) {

				pts = [];

				// find all lines that intersect text line base
				for(t = 0; t < len - 3; t += 2) {
					if ((points[t+1] <= y && points[t+3] >= y) || (points[t+3] <= y && points[t+1] >= y)) {
						pt = getIntersection(-0xffff, y, 0xffff, points[t] + 0.5, points[t+1], points[t+2] + 0.5, points[t+3]);
						if (pt) pts.push(pt)
					}
				}

				// end -> start (fill is always closed)
				pt = getIntersection(-0xffff, y, 0xffff, points[len-2] + 0.5, points[len-1], points[0] + 0.5, points[1]);
				if (pt) pts.push(pt);

				// sort points and create ranges
				if (pts.length > 1) {

					pts.sort(function(a, b) { return a.x - b.x });

					/*
						Check ranges for non-zero winding or even-odd fill
					 */

					// todo non-zero
					// - get center point between two x's
					// - cast ray left and right, count windings and direction
					// - if !0 add to new array
					// ? move this to separate function so it can be embedded in the intersection stage

					// even-odd ranges
					for(t = 0; t < pts.length - 1; t += 2) {
						//if (pts[t] && pts[t+1]) {
							ranges.push({
								x1: Math.max(0, Math.min(w, Math.round(pts[t  ].x) )),
								x2: Math.max(0, Math.min(w, Math.round(pts[t+1].x) )),
								y: pts[t].y|0
							});
						//}
					}
				}
			}

			return ranges
		}

		// note: this is reduced to assume same y for first line
		function getIntersection(p0x, p0y, p1x, p2x, p2y, p3x, p3y) {

			// In our case p2y=p3y would be a parallel line
			if ((p2y|0) === (p3y|0)) return null;

			var	d1x = p1x - p0x,
				d2x = p3x - p2x,
				d2y = p3y - p2y,
				d = d1x * d2y,
				px, py, s, t;

			if (d === 0) return null;

			py = p0y - p2y;
			s = (d1x * py) / d;

			if (s >= 0 && s <= 1) {
				px = p0x - p2x;
				t = (d2x * py - d2y * px) / d;
				if (t >= 0 && t <= 1) {
					return {
						x: p0x + (t * d1x),
						y: p0y
					}
				}
			}

			return null;
		}
	},

	drawImage: function(srcData, state, dx, dy) {

		var w = this.width,
			h = this.height,
			sw = srcData.width,
			sh = srcData.height,
			idata = this.ctx.createImageData(w, h),
			dstBmp = new Uint32Array(idata.data.buffer),
			srcBmp = new Uint32Array(srcData.data.buffer),
			im = state.matrix.inverse(),
			x, y, p, sx, sy;

		if (im.isIdentity()) {

			for(y = 0; y < h; y++) {
				for(x = 0; x < w; x++) {
					sx = x - dx;
					sy = y - dy;
					if (sx >= 0 && sx < sw && sx >= 0 && sy < sh)
						dstBmp[y * w + x] = srcBmp[sy * sw + sx];
				}
			}

		}
		else {
			for(y = 0; y < h; y++) {
				for(x = 0; x < w; x++) {
					p = im.applyToPoint(x, y);
					sx = Math.round(p.x) - dx;
					sy = Math.round(p.y) - dy;
					if (sx >= 0 && sx < sw && sx >= 0 && sy < sh)
						dstBmp[y * w + x] = srcBmp[sy * sw + sx];
				}
			}
		}

		this.ctx.putImageData(idata, 0, 0);
	}

};