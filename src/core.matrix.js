/*
	Stripped down version of the Matrix (v2.3.2 MODIFIED). See original:
	https://github.com/epistemex/transformation-matrix-js
*/

/**
 * 2D transformation _8bit.Matrix object initialized with identity _8bit.Matrix.
 *
 * The _8bit.Matrix can synchronize a canvas 2D context by supplying the context
 * as an argument, or later apply current absolute transform to an
 * existing context.
 *
 * To synchronize a DOM element you can use [`toCSS()`]{@link _8bit.Matrix#toCSS} or [`toCSS3D()`]{@link _8bit.Matrix#toCSS3D}.
 *
 * @param {CanvasRenderingContext2D} [context] - Optional context to sync with _8bit.Matrix
 * @prop {number} a - scale x
 * @prop {number} b - shear y
 * @prop {number} c - shear x
 * @prop {number} d - scale y
 * @prop {number} e - translate x
 * @prop {number} f - translate y
 * @prop {CanvasRenderingContext2D|null} [context=null] - set or get current canvas context
 * @constructor
 * @license MIT license (header required)
 * @copyright Epistemex.com 2014-2016
 */
_8bit.Matrix = function(context) {

	var me = this;
	me._t = me.transform;

	me.a = me.d = 1;
	me.b = me.c = me.e = me.f = 0;

	// reset canvas to enable 100% sync.
	if (context)
		(me.context = context).setTransform(1, 0, 0, 1, 0, 0);
};

/**
 * Create a new _8bit.Matrix from a SVGCanvas8BitContext.Matrix
 *
 * @param {SVGMatrix} svgMatrix - source SVG _8bit.Matrix
 * @param {CanvasRenderingContext2D} [context] - optional canvas 2D context to use for the _8bit.Matrix
 * @returns {_8bit.Matrix}
 * @static
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGCanvas8BitContext.Matrix|MDN / SVGCanvas8BitContext.Matrix}
 */
_8bit.Matrix.fromSVGMatrix = function(svgMatrix, context) {
	return new _8bit.Matrix(context).multiply(svgCanvas8BitContext.Matrix)
};

/**
 * Create and transform a new _8bit.Matrix based on given _8bit.Matrix values.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 * @param {number} e
 * @param {number} f
 * @param {CanvasRenderingContext2D} [context] - optional canvas context to synchronize
 * @returns {_8bit.Matrix}
 * @static
 */
_8bit.Matrix.from = function(a, b, c, d, e, f, context) {
	return new _8bit.Matrix(context).setTransform(a, b, c, d, e, f)
};

_8bit.Matrix.prototype = {

	/**
	 * Concatenates transforms of this _8bit.Matrix onto the given child _8bit.Matrix and
	 * returns a new _8bit.Matrix. This instance is used on left side.
	 *
	 * @param {_8bit.Matrix|SVGCanvas8BitContext.Matrix} cm - child _8bit.Matrix to apply concatenation to
	 * @returns {_8bit.Matrix} - new _8bit.Matrix instance
	 */
	concat: function(cm) {
		return this.clone().multiply(cm)
	},

	/**
	 * Flips the horizontal values.
	 * @returns {_8bit.Matrix}
	 */
	flipX: function() {
		return this._t(-1, 0, 0, 1, 0, 0)
	},

	/**
	 * Flips the vertical values.
	 * @returns {_8bit.Matrix}
	 */
	flipY: function() {
		return this._t(1, 0, 0, -1, 0, 0)
	},

	/**
	 * Reflects incoming (velocity) vector on the normal which will be the
	 * current transformed x axis. Call when a trigger condition is met.
	 *
	 * @param {number} x - vector end point for x (start = 0)
	 * @param {number} y - vector end point for y (start = 0)
	 * @returns {{x: number, y: number}}
	 */
	reflectVector: function(x, y) {

		var v = this.applyToPoint(0, 1),
			d = (v.x * x + v.y * y) * 2;

		x -= d * v.x;
		y -= d * v.y;

		return {x: x, y: y}
	},

	/**
	 * Short-hand to reset current _8bit.Matrix to an identity _8bit.Matrix.
	 * @returns {_8bit.Matrix}
	 */
	reset: function() {
		return this.setTransform(1, 0, 0, 1, 0, 0)
	},

	/**
	 * Rotates current _8bit.Matrix by angle (accumulative).
	 * @param {number} angle - angle in radians
	 * @returns {_8bit.Matrix}
	 */
	rotate: function(angle) {
		var cos = Math.cos(angle),
			sin = Math.sin(angle);
		return this._t(cos, sin, -sin, cos, 0, 0)
	},

	/**
	 * Converts a vector given as `x` and `y` to angle, and
	 * rotates (accumulative).
	 * @param x
	 * @param y
	 * @returns {_8bit.Matrix}
	 */
	rotateFromVector: function(x, y) {
		return this.rotate(Math.atan2(y, x))
	},

	/**
	 * Helper method to make a rotation based on an angle in degrees.
	 * @param {number} angle - angle in degrees
	 * @returns {_8bit.Matrix}
	 */
	rotateDeg: function(angle) {
		return this.rotate(angle * Math.PI / 180)
	},

	/**
	 * Scales current _8bit.Matrix uniformly and accumulative.
	 * @param {number} f - scale factor for both x and y (1 does nothing)
	 * @returns {_8bit.Matrix}
	 */
	scaleU: function(f) {
		return this._t(f, 0, 0, f, 0, 0)
	},

	/**
	 * Scales current _8bit.Matrix accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 * @param {number} sy - scale factor y (1 does nothing)
	 * @returns {_8bit.Matrix}
	 */
	scale: function(sx, sy) {
		return this._t(sx, 0, 0, sy, 0, 0)
	},

	/**
	 * Scales current _8bit.Matrix on x axis accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 * @returns {_8bit.Matrix}
	 */
	scaleX: function(sx) {
		return this._t(sx, 0, 0, 1, 0, 0)
	},

	/**
	 * Scales current _8bit.Matrix on y axis accumulative.
	 * @param {number} sy - scale factor y (1 does nothing)
	 * @returns {_8bit.Matrix}
	 */
	scaleY: function(sy) {
		return this._t(1, 0, 0, sy, 0, 0)
	},

	/**
	 * Apply shear to the current _8bit.Matrix accumulative.
	 * @param {number} sx - amount of shear for x
	 * @param {number} sy - amount of shear for y
	 * @returns {_8bit.Matrix}
	 */
	shear: function(sx, sy) {
		return this._t(1, sy, sx, 1, 0, 0)
	},

	/**
	 * Apply shear for x to the current _8bit.Matrix accumulative.
	 * @param {number} sx - amount of shear for x
	 * @returns {_8bit.Matrix}
	 */
	shearX: function(sx) {
		return this._t(1, 0, sx, 1, 0, 0)
	},

	/**
	 * Apply shear for y to the current _8bit.Matrix accumulative.
	 * @param {number} sy - amount of shear for y
	 * @returns {_8bit.Matrix}
	 */
	shearY: function(sy) {
		return this._t(1, sy, 0, 1, 0, 0)
	},

	/**
	 * Apply skew to the current _8bit.Matrix accumulative. Angles in radians.
	 * Also see [`skewDeg()`]{@link _8bit.Matrix#skewDeg}.
	 * @param {number} ax - angle of skew for x
	 * @param {number} ay - angle of skew for y
	 * @returns {_8bit.Matrix}
	 */
	skew: function(ax, ay) {
		return this.shear(Math.tan(ax), Math.tan(ay))
	},

	/**
	 * Apply skew to the current _8bit.Matrix accumulative. Angles in degrees.
	 * Also see [`skew()`]{@link _8bit.Matrix#skew}.
	 * @param {number} ax - angle of skew for x
	 * @param {number} ay - angle of skew for y
	 * @returns {_8bit.Matrix}
	 */
	skewDeg: function(ax, ay) {
		return this.shear(Math.tan(ax / 180 * Math.PI), Math.tan(ay / 180 * Math.PI))
	},

	/**
	 * Apply skew for x to the current _8bit.Matrix accumulative. Angles in radians.
	 * Also see [`skewDeg()`]{@link _8bit.Matrix#skewDeg}.
	 * @param {number} ax - angle of skew for x
	 * @returns {_8bit.Matrix}
	 */
	skewX: function(ax) {
		return this.shearX(Math.tan(ax))
	},

	/**
	 * Apply skew for y to the current _8bit.Matrix accumulative. Angles in radians.
	 * Also see [`skewDeg()`]{@link _8bit.Matrix#skewDeg}.
	 * @param {number} ay - angle of skew for y
	 * @returns {_8bit.Matrix}
	 */
	skewY: function(ay) {
		return this.shearY(Math.tan(ay))
	},

	/**
	 * Set current _8bit.Matrix to new absolute _8bit.Matrix.
	 * @param {number} a - scale x
	 * @param {number} b - shear y
	 * @param {number} c - shear x
	 * @param {number} d - scale y
	 * @param {number} e - translate x
	 * @param {number} f - translate y
	 * @returns {_8bit.Matrix}
	 */
	setTransform: function(a, b, c, d, e, f) {
		var me = this;
		me.a = a;
		me.b = b;
		me.c = c;
		me.d = d;
		me.e = e;
		me.f = f;
		return me._x()
	},

	/**
	 * Translate current _8bit.Matrix accumulative.
	 * @param {number} tx - translation for x
	 * @param {number} ty - translation for y
	 * @returns {_8bit.Matrix}
	 */
	translate: function(tx, ty) {
		return this._t(1, 0, 0, 1, tx, ty)
	},

	/**
	 * Translate current _8bit.Matrix on x axis accumulative.
	 * @param {number} tx - translation for x
	 * @returns {_8bit.Matrix}
	 */
	translateX: function(tx) {
		return this._t(1, 0, 0, 1, tx, 0)
	},

	/**
	 * Translate current _8bit.Matrix on y axis accumulative.
	 * @param {number} ty - translation for y
	 * @returns {_8bit.Matrix}
	 */
	translateY: function(ty) {
		return this._t(1, 0, 0, 1, 0, ty)
	},

	/**
	 * Multiplies current _8bit.Matrix with new _8bit.Matrix values. Also see [`multiply()`]{@link _8bit.Matrix#multiply}.
	 *
	 * @param {number} a2 - scale x
	 * @param {number} b2 - shear y
	 * @param {number} c2 - shear x
	 * @param {number} d2 - scale y
	 * @param {number} e2 - translate x
	 * @param {number} f2 - translate y
	 * @returns {_8bit.Matrix}
	 */
	transform: function(a2, b2, c2, d2, e2, f2) {

		var me = this,
			a1 = me.a,
			b1 = me.b,
			c1 = me.c,
			d1 = me.d,
			e1 = me.e,
			f1 = me.f;

		/* _8bit.Matrix order (canvas compatible):
		* ace
		* bdf
		* 001
		*/
		me.a = a1 * a2 + c1 * b2;
		me.b = b1 * a2 + d1 * b2;
		me.c = a1 * c2 + c1 * d2;
		me.d = b1 * c2 + d1 * d2;
		me.e = a1 * e2 + c1 * f2 + e1;
		me.f = b1 * e2 + d1 * f2 + f1;

		return me._x()
	},

	/**
	 * Multiplies current _8bit.Matrix with source _8bit.Matrix.
	 * @param {_8bit.Matrix} m - source _8bit.Matrix to multiply with.
	 * @returns {_8bit.Matrix}
	 */
	multiply: function(m) {
		return this._t(m.a, m.b, m.c, m.d, m.e, m.f)
	},

	/**
	 * Divide this _8bit.Matrix on input _8bit.Matrix which must be invertible.
	 * @param {_8bit.Matrix} m - _8bit.Matrix to divide on (divisor)
	 * @throws Exception is input _8bit.Matrix is not invertible
	 * @returns {_8bit.Matrix}
	 */
	divide: function(m) {

		if (!m.isInvertible())
			throw "_8bit.Matrix not invertible";

		return this.multiply(m.inverse())
	},

	/**
	 * Divide current _8bit.Matrix on scalar value != 0.
	 * @param {number} d - divisor (can not be 0)
	 * @returns {_8bit.Matrix}
	 */
	divideScalar: function(d) {

		var me = this;
		me.a /= d;
		me.b /= d;
		me.c /= d;
		me.d /= d;
		me.e /= d;
		me.f /= d;

		return me._x()
	},

	/**
	 * Get an inverse _8bit.Matrix of current _8bit.Matrix. The method returns a new
	 * _8bit.Matrix with values you need to use to get to an identity _8bit.Matrix.
	 * Context from parent _8bit.Matrix is not applied to the returned _8bit.Matrix.
	 *
	 * @param {boolean} [cloneContext=false] - clone current context to resulting _8bit.Matrix
	 * @throws Exception is input _8bit.Matrix is not invertible
	 * @returns {_8bit.Matrix} - new _8bit.Matrix instance
	 */
	inverse: function(cloneContext) {

		var me = this,
			m  = new _8bit.Matrix(cloneContext ? me.context : null),
			dt = me.determinant();

		if (me._q(dt, 0))
			throw "_8bit.Matrix not invertible.";

		m.a = me.d / dt;
		m.b = -me.b / dt;
		m.c = -me.c / dt;
		m.d = me.a / dt;
		m.e = (me.c * me.f - me.d * me.e) / dt;
		m.f = -(me.a * me.f - me.b * me.e) / dt;

		return m
	},

	/**
	 * Interpolate this _8bit.Matrix with another and produce a new _8bit.Matrix.
	 * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
	 * 1 is equal to the second _8bit.Matrix. The `t` value is not clamped.
	 *
	 * Context from parent _8bit.Matrix is not applied to the returned _8bit.Matrix.
	 *
	 * Note: this interpolation is naive. For animation containing rotation,
	 * shear or skew use the [`interpolateAnim()`]{@link _8bit.Matrix#interpolateAnim} method instead
	 * to avoid unintended flipping.
	 *
	 * @param {_8bit.Matrix} m2 - the _8bit.Matrix to interpolate with.
	 * @param {number} t - interpolation [0.0, 1.0]
	 * @param {CanvasRenderingContext2D} [context] - optional context to affect
	 * @returns {_8bit.Matrix} - new _8bit.Matrix instance with the interpolated result
	 */
	interpolate: function(m2, t, context) {

		var me = this,
			m  = context ? new _8bit.Matrix(context) : new _8bit.Matrix();

		m.a = me.a + (m2.a - me.a) * t;
		m.b = me.b + (m2.b - me.b) * t;
		m.c = me.c + (m2.c - me.c) * t;
		m.d = me.d + (m2.d - me.d) * t;
		m.e = me.e + (m2.e - me.e) * t;
		m.f = me.f + (m2.f - me.f) * t;

		return m._x()
	},

	/**
	 * Interpolate this _8bit.Matrix with another and produce a new _8bit.Matrix.
	 * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
	 * 1 is equal to the second _8bit.Matrix. The `t` value is not constrained.
	 *
	 * Context from parent _8bit.Matrix is not applied to the returned _8bit.Matrix.
	 *
	 * To obtain easing `t` can be preprocessed using easing-functions
	 * before being passed to this method.
	 *
	 * Note: this interpolation method uses decomposition which makes
	 * it suitable for animations (in particular where rotation takes
	 * places).
	 *
	 * @param {_8bit.Matrix} m2 - the _8bit.Matrix to interpolate with.
	 * @param {number} t - interpolation [0.0, 1.0]
	 * @param {CanvasRenderingContext2D} [context] - optional context to affect
	 * @returns {_8bit.Matrix} - new _8bit.Matrix instance with the interpolated result
	 */
	interpolateAnim: function(m2, t, context) {

		var m          = new _8bit.Matrix(context ? context : null),
			d1         = this.decompose(),
			d2         = m2.decompose(),
			t1         = d1.translate,
			t2         = d2.translate,
			s1         = d1.scale,
			rotation   = d1.rotation + (d2.rotation - d1.rotation) * t,
			translateX = t1.x + (t2.x - t1.x) * t,
			translateY = t1.y + (t2.y - t1.y) * t,
			scaleX     = s1.x + (d2.scale.x - s1.x) * t,
			scaleY     = s1.y + (d2.scale.y - s1.y) * t
			;

		// QR order (t-r-s-sk)
		m.translate(translateX, translateY);
		m.rotate(rotation);
		m.scale(scaleX, scaleY);
		//todo test skew scenarios

		return m._x()
	},

	/**
	 * Decompose the current _8bit.Matrix into simple transforms using either
	 * QR (default) or LU decomposition.
	 *
	 * @param {boolean} [useLU=false] - set to true to use LU rather than QR decomposition
	 * @returns {*} - an object containing current decomposed values (translate, rotation, scale, skew)
	 * @see {@link http://www.maths-informatique-jeux.com/blog/frederic/?post/2013/12/01/Decomposition-of-2D-transform-matrices|Adoption based on this code}
	 * @see {@link https://en.wikipedia.org/wiki/QR_decomposition|More on QR decomposition}
	 * @see {@link https://en.wikipedia.org/wiki/LU_decomposition|More on LU decomposition}
	 */
	decompose: function(useLU) {

		var me        = this,
			a         = me.a,
			b         = me.b,
			c         = me.c,
			d         = me.d,
			acos      = Math.acos,
			atan      = Math.atan,
			sqrt      = Math.sqrt,
			pi        = Math.PI,

			translate = {x: me.e, y: me.f},
			rotation  = 0,
			scale     = {x: 1, y: 1},
			skew      = {x: 0, y: 0},

			determ    = a * d - b * c;	// determinant(), skip DRY here...

		if (useLU) {
			if (a) {
				skew = {x: atan(c / a), y: atan(b / a)};
				scale = {x: a, y: determ / a};
			}
			else if (b) {
				rotation = pi * 0.5;
				scale = {x: b, y: determ / b};
				skew.x = atan(d / b);
			}
			else { // a = b = 0
				scale = {x: c, y: d};
				skew.x = pi * 0.25;
			}
		}
		else {
			// Apply the QR-like decomposition.
			if (a || b) {
				var r = sqrt(a * a + b * b);
				rotation = b > 0 ? acos(a / r) : -acos(a / r);
				scale = {x: r, y: determ / r};
				skew.x = atan((a * c + b * d) / (r * r));
			}
			else if (c || d) {
				var s = sqrt(c * c + d * d);
				rotation = pi * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));
				scale = {x: determ / s, y: s};
				skew.y = atan((a * c + b * d) / (s * s));
			}
			else { // a = b = c = d = 0
				scale = {x: 0, y: 0};
			}
		}

		return {
			translate: translate,
			rotation : rotation,
			scale    : scale,
			skew     : skew
		}
	},

	/**
	 * Returns the determinant of the current _8bit.Matrix.
	 * @returns {number}
	 */
	determinant: function() {
		return this.a * this.d - this.b * this.c
	},

	/**
	 * Apply current _8bit.Matrix to `x` and `y` of a point.
	 * Returns a point object.
	 *
	 * @param {number} x - value for x
	 * @param {number} y - value for y
	 * @returns {{x: number, y: number}} A new transformed point object
	 */
	applyToPoint: function(x, y) {

		var me = this;

		return {
			x: Math.round(x * me.a + y * me.c + me.e),
			y: Math.round(x * me.b + y * me.d + me.f)
		}
	},

	/**
	 * Apply current _8bit.Matrix to array with point objects or point pairs.
	 * Returns a new array with points in the same format as the input array.
	 *
	 * A point object is an object literal:
	 *
	 *     {x: x, y: y}
	 *
	 * so an array would contain either:
	 *
	 *     [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
	 *
	 * or
	 *
	 *     [x1, y1, x2, y2, ... xn, yn]
	 *
	 * @param {Array} points - array with point objects or pairs
	 * @returns {Array} A new array with transformed points
	 */
	applyToArray: function(points) {

		var i = 0, p, l,
			mxPoints = [];

		l = points.length;

		if (this.isIdentity()) {
			while(i < l)
				mxPoints.push((points[i++] + 0.5)|0, (points[i++] + 0.5)|0);
		}
		else {
			while(i < l) {
				p = this.applyToPoint(points[i++], points[i++]);
				mxPoints.push((p.x + 0.5)|0, (p.y + 0.5)|0);
			}
		}

		return mxPoints
	},

	/**
	 * Apply to any canvas 2D context object. This does not affect the
	 * context that optionally was referenced in constructor unless it is
	 * the same context.
	 *
	 * @param {CanvasRenderingContext2D} context - target context
	 * @returns {_8bit.Matrix}
	 */
	applyToContext: function(context) {
		var me = this;
		context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
		return me
	},

	/**
	 * Returns true if _8bit.Matrix is an identity _8bit.Matrix (no transforms applied).
	 * @returns {boolean}
	 */
	isIdentity: function() {
		var me = this;
		return me._q(me.a, 1) &&
			me._q(me.b, 0) &&
			me._q(me.c, 0) &&
			me._q(me.d, 1) &&
			me._q(me.e, 0) &&
			me._q(me.f, 0)
	},

	/**
	 * Returns true if _8bit.Matrix is invertible
	 * @returns {boolean}
	 */
	isInvertible: function() {
		return !this._q(this.determinant(), 0)
	},

	/**
	 * The method is intended for situations where scale is accumulated
	 * via multiplications, to detect situations where scale becomes
	 * "trapped" with a value of zero. And in which case scale must be
	 * set explicitly to a non-zero value.
	 *
	 * @returns {boolean}
	 */
	isValid: function() {
		return !(this.a * this.d)
	},

	/**
	 * Compares current _8bit.Matrix with another _8bit.Matrix. Returns true if equal
	 * (within epsilon tolerance).
	 * @param {_8bit.Matrix} m - _8bit.Matrix to compare this _8bit.Matrix with
	 * @returns {boolean}
	 */
	isEqual: function(m) {

		var me = this,
			q = me._q;

		return  q(me.a, m.a) &&
				q(me.b, m.b) &&
				q(me.c, m.c) &&
				q(me.d, m.d) &&
				q(me.e, m.e) &&
				q(me.f, m.f)
	},

	/**
	 * Clones current instance and returning a new _8bit.Matrix.
	 * @param {_8bit.Matrix} [s] - source matrix
	 * @returns {_8bit.Matrix} - a new _8bit.Matrix instance with identical transformations as this instance
	 */
	clone: function(s) {
		if (s) {	// specially for 8bit
			this.a = s.a;
			this.b = s.b;
			this.c = s.c;
			this.d = s.d;
			this.e = s.e;
			this.f = s.f;
		}
		else
			return new _8bit.Matrix().multiply(this)
	},

	/**
	 * Returns an array with current _8bit.Matrix values.
	 * @returns {Array}
	 */
	toArray: function() {
		var me = this;
		return [me.a, me.b, me.c, me.d, me.e, me.f]
	},

	/**
	 * Returns a binary typed array, either as 32-bit (default) or
	 * 64-bit.
	 * @param {boolean} [use64=false] chose whether to use 32-bit or 64-bit typed array
	 * @returns {*}
	 */
	toTypedArray: function(use64) {

		var a  = use64 ? new Float64Array(6) : new Float32Array(6),
			me = this;

		a[0] = me.a;
		a[1] = me.b;
		a[2] = me.c;
		a[3] = me.d;
		a[4] = me.e;
		a[5] = me.f;

		return a
	},

	/**
	 * Generates a string that can be used with CSS `transform`.
	 * @example
	 *     element.style.transform = m.toCSS();
	 * @returns {string}
	 */
	toCSS: function() {
		return "_8bit.Matrix(" + this.toArray() + ")"
	},

	/**
	 * Generates a `_8bit.Matrix3d()` string that can be used with CSS `transform`.
	 * Although the _8bit.Matrix is for 2D use you may see performance benefits
	 * on some devices using a 3D CSS transform instead of a 2D.
	 * @example
	 *     element.style.transform = m.toCSS3D();
	 * @returns {string}
	 */
	toCSS3D: function() {
		var me = this;
		return "_8bit.Matrix3d(" + me.a + "," + me.b + ",0,0," + me.c + "," + me.d + ",0,0,0,0,1,0," + me.e + "," + me.f + ",0,1)"
	},

	/**
	 * Returns a JSON compatible string of current _8bit.Matrix.
	 * @returns {string}
	 */
	toJSON: function() {
		var me = this;
		return '{"a":' + me.a + ',"b":' + me.b + ',"c":' + me.c + ',"d":' + me.d + ',"e":' + me.e + ',"f":' + me.f + '}'
	},

	/**
	 * Returns a string with current _8bit.Matrix as comma-separated list.
	 * @param {number} [fixLen=4] - truncate decimal values to number of digits
	 * @returns {string}
	 */
	toString: function(fixLen) {
		var me = this;
		fixLen = fixLen || 4;
		return 	 "a=" + me.a.toFixed(fixLen) +
				" b=" + me.b.toFixed(fixLen) +
				" c=" + me.c.toFixed(fixLen) +
				" d=" + me.d.toFixed(fixLen) +
				" e=" + me.e.toFixed(fixLen) +
				" f=" + me.f.toFixed(fixLen)
	},

	/**
	 * Compares floating point values with some tolerance (epsilon)
	 * @param {number} f1 - float 1
	 * @param {number} f2 - float 2
	 * @returns {boolean}
	 * @private
	 */
	_q: function(f1, f2) {
		return Math.abs(f1 - f2) < 1e-14
	},

	/**
	 * Apply current absolute _8bit.Matrix to context if defined, to sync it.
	 * @returns {_8bit.Matrix}
	 * @private
	 */
	_x: function() {
		var me = this;
		if (me.context)
			me.context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
		return me
	}
};
