/*
	8-bit Path2D object
 */

/**
 * Path2D equivalent for 8-bit context (private)
 * @constructor
 */
_8bit.Path2D = function(m) {
	this.paths = [new _8bit.Path2D.Path()];
	this.cp = 0;
	this.step = 0.025;
	this.matrix = m || new _8bit.Matrix();
	this.cx = 0;
	this.cy = 0;
};

_8bit.Path2D.prototype = {

	_new: function() {
		this.paths.push(new _8bit.Path2D.Path());
		this.cp = this.paths.length -1;
	},

	addPath: function(path2d, m) {
		var p, paths = this.paths;

		if (m) {
			path2d.paths.forEach(function(p) {
				paths.push(new _8bit.Path2D.Path(m.applyToArray(p.points)))
			});

			p = m.applyToPoint(path2d.cx, path2d.cy);
			this.cx = p.x;
			this.cy = p.y;
		}
		else {
			this.paths = paths.concat(path2d.paths);
			this.cx = path2d.cx;
			this.cy = path2d.cy;
		}

		this._new()
	},

	moveTo: function(x, y, noMatrix) {

		if (this.paths[this.cp].points.length) {
			this._new()
		}

		var p = noMatrix ? {x:x, y:y} : this.matrix.applyToPoint(x, y);
		this.paths[this.cp].add(p.x, p.y);

		this.cx = x;
		this.cy = y
	},

	closePath: function(){
		var path = this.paths[this.cp];
		if (path.points.length) {
			path.isClosed = true;
			this.moveTo(path.points[0], path.points[1], true);			// note: already transformed (would need inverse matrix)
		}
	},

	lineTo: function(x, y) {
		var p = this.matrix.applyToPoint(x, y);
		this.paths[this.cp].add(p.x, p.y);

		this.cx = x;
		this.cy = y
	},

	arc: function(x, y, r, sa, ea, ccw) {

		var path = this.paths[this.cp],
			step = 4 / (Math.PI * r),
			l = path.points.length,
			m = this.matrix, p;

		sa = sa % (Math.PI*2);
		ea = ea % (Math.PI*2);
		if (r < 0) throw new RangeError("IndexSizeError.");

		if (ccw) {
			if (sa < ea) ea -= Math.PI*2;
			if (sa === ea) ea -= Math.PI*2;
			for(; sa >= ea; sa -= step) {
				p = m.applyToPoint(x + r * Math.cos(sa), y + r * Math.sin(sa));
				path.add(p.x, p.y)
			}
		}
		else {
			if (sa > ea) ea += Math.PI*2;
			if (sa === ea) ea += Math.PI*2;
			for(; sa <= ea; sa += step) {
				p = m.applyToPoint(x + r * Math.cos(sa), y + r * Math.sin(sa));
				path.add(p.x, p.y)
			}
		}

		this.cx = path.points[l-2];
		this.cy = path.points[l-1]
	},

	arcTo: function(x1, y1, x2, y2, rx, ry, rot) {

		if (rx < 0) throw new RangeError("IndexSizeError.");

		if (typeof ry === "number") {
			if (ry < 0) throw new RangeError("IndexSizeError.")
		}
		else ry = rx;

		if (typeof rot !== "number") rot = 0;

		var path = this.paths[this.cp],
			l = path.points.length,
			x0 = l > 1 ? path.points[l-2] : x1-1,			//fixme arcTo def. start not correct in this case
			y0 = l > 1 ? path.points[l-1] : y1-1,
			t1 = (y1 - y0) / (x1 - x0),
			t2 = (y2 - y1) / (x2 - x1),
			t = Math.atan((t1 - t2) / (1 + t1 * t2)),
			th = rx / Math.tan(t * 0.5),
			xi =  Math.abs(Math.sqrt(th * th / (1 + t1 * t1))),
			yi = Math.abs(xi * t1),
			xi1 =  x1 > x0 ? x1 - xi : x1 + xi,
			yi1 = y1 > y0 ? y1 - yi : y1 + yi,
			t1i = -1 / t1,
			xi2, yi2, cx, cy;

		xi = Math.abs(Math.sqrt(th * th / (1 + t2 * t2)));
		yi = Math.abs(xi * t2);
		xi2 = x2 > x1 ? x1 + xi : x1 - xi;
		yi2 = y2 > y1 ? y1 + yi : y1 - yi;

		xi = Math.abs(Math.sqrt(rx * rx / (1 + t1i * t1i)));
		yi = Math.abs(xi * t1i);
		cx = xi1 + xi;
		cy = yi1 + yi;

		if (rx === 0)
			this.lineTo(x1, y1);

		if (rx === ry)
			this.arc(cx, cy, rx, Math.atan2(yi1 - cy, xi1 - cx), Math.atan2(yi2 - cy, xi2 - cx));
		else
			this.ellipse(cx, cy, rx, ry, rot, Math.atan2(yi1 - cy, xi1 - cx), Math.atan2(yi2 - cy, xi2 - cx));

	},

	ellipse: function(x, y, rx, ry, rot, sa, ea, ccw) {

		sa = sa % (Math.PI*2);
		ea = ea % (Math.PI*2);
		if (rx < 0 || ry < 0) throw new RangeError("IndexSizeError.");

		var path = this.paths[this.cp],
			l = path.points.length,
			step = 2 / (Math.PI * Math.min(rx, ry)),
			cos = Math.cos(rot),
			sin = Math.sin(rot),
			m = this.matrix,
			p, ex, ey;

		if (ccw) {
			if (sa < ea) ea -= Math.PI*2;
			for(; sa >= ea; sa -= step) {
				ex = rx * Math.cos(sa);
				ey = ry * Math.sin(sa);
				p = m.applyToPoint(
					x + cos * ex - sin * ey,
					y + sin * ex + cos * ey
				);
				path.add(p.x, p.y)
			}
		}
		else {
			if (sa > ea) ea += Math.PI*2;
			for(; sa <= ea; sa += step) {
				ex = rx * Math.cos(sa);
				ey = ry * Math.sin(sa);
				p = m.applyToPoint(
					x + cos * ex - sin * ey,
					y + sin * ex + cos * ey
				);
				path.add(p.x, p.y)
			}
		}

		this.cx = path.points[l-2];
		this.cy = path.points[l-1]
	},

	rect: function(x, y, w, h) {

		var path, p;

		this.moveTo(x, y);			// ul
		path = this.paths[this.cp];

		p = this.matrix.applyToArray([x + w, y, x + w, y + h, x, y + h]);
		path.add(p[0], p[1]);		// ur
		path.add(p[2], p[3]);		// br
		path.add(p[4], p[5]);		// bl
		this.closePath();

		this.cx = p[0];
		this.cy = p[1]
	},

	/**
	 * Renders a 2. order Bezier curve (quadratic).
	 * Each point is given as an integer value.
	 *
	 * @param {Number} cx - control point x
	 * @param {Number} cy - control point y
	 * @param {Number} x - end point x
	 * @param {Number} y - end point y
	 */
	quadraticCurveTo: function(cx, cy, x, y) {

		var path = this.paths[this.cp],
			l = path.points.length,
			sx = l > 1 ? this.cx : cx,
			sy = l > 1 ? this.cy : cy,
			step = this.step,
			m = this.matrix, p,
			t = step;

		// B(t) = (1-t)^2 * Z0 + 2(1-t)t * C + t^2 * Z1   for 0 <= t <= 1
		for(; t < 1; t += step) {
			var t1 = (1 - t);
			p = m.applyToPoint(
				t1 * t1 * sx + 2 * t1 * t * cx + t * t * x,
				t1 * t1 * sy + 2 * t1 * t * cy + t * t * y
			);
			path.add(p.x, p.y)
		}

		p = m.applyToPoint(x, y);
		path.add(p.x, p.y);

		this.cx = x;
		this.cy = y
	},

	bezierCurveTo: function(cx1, cy1, cx2, cy2, x, y) {

		var path = this.paths[this.cp],
			l = path.points.length,
			sx = l > 1 ? this.cx : cx1,
			sy = l > 1 ? this.cy : cy1,
			step = this.step,
			m = this.matrix, p,
			t = step, tm1, tm12, tmm23;

		// B(t) = (1-t)^3 * z0 + 3t (1-t)^2 * c0 + 3 t^2 (1-t) * c1 + t^3 * z1   for 0 <= t <= 1
		for(; t < 1; t += step) {
			tm1 = 1 - t;				// (1 - t)
			tm12 = tm1 * tm1;			// (1 - t) ^ 2
			tmm23 = t * t * 3 * tm1;	// t ^ 2 * 3 * (1 - t)

			p = m.applyToPoint(
				tm12 * tm1 * sx + t * 3 * tm12 * cx1 + tmm23 * cx2 + t * t * t * x,
				tm12 * tm1 * sy + t * 3 * tm12 * cy1 + tmm23 * cy2 + t * t * t * y
			);
			path.add(p.x, p.y)
		}

		p = m.applyToPoint(x, y);
		path.add(p.x, p.y);

		this.cx = x;
		this.cy = y
	}
};
