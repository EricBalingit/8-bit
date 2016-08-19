/*
	8-bit Color object
	© 2016 Epistemex
	www.epistemex.com
*/
/**
 * Canvas8BitContext.COLOR object
 * @class _8bit.Color
 * @param {Number} [r] - red or Uint32
 * @param {Number} [g] - green
 * @param {Number} [b] - blue
 * @constructor
 */
_8bit.Color = function(r, g, b) {

	if (arguments.length === 1) {
		g = this.int2rgb(r);
		this.r = g[0];
		this.g = g[1];
		this.b = g[2];
		this.int32 = r;
	}
	else if (arguments.length === 3) {
		this.r = Math.min(Math.max(0, (r + 0.5)|0), 255);
		this.g = Math.min(Math.max(0, (g + 0.5)|0), 255);
		this.b = Math.min(Math.max(0, (b + 0.5)|0), 255);
		this.int32 = this.rgb2int(this.r, this.g, this.b);
	}
	else {
		this.r = 0;
		this.g = 0;
		this.b = 0;
		this.int32 = 0;
	}
};

_8bit.Color.fromCSS = function(css) {

	var div = document.createElement("div"),
		cs, rgb, a;

	// create a temp element
	div.style.cssText = "width:1px;height:1px;position:fixed;left:-10px;top:-10px;background-color:" + css;
	document.body.appendChild(div);
	cs = getComputedStyle(div).getPropertyValue("background-color");
	document.body.removeChild(div);

	rgb = cs === "transparent" ? "(0,0,0,0)" : (cs.substr(0, 3) === "rgb" ? cs : "(0,0,0)");
	rgb = rgb.substring(rgb.indexOf("(") + 1, rgb.length - 1);
	a = rgb.split(",");

	return new _8bit.Color(+a[0], +a[1], +a[2])
};

_8bit.Color.prototype = {

	/**
	 * Adds given _8bit.Color to current color of the instance and returns
	 * the result as a new _8bit.Color instance.
	 *
	 * @param {_8bit.Color} c Color object
	 * @returns {_8bit.Color}
	 */
	add: function(c) {
		return new _8bit.Color(this.r + c.r, this.g + c.g, this.b + c.b)
	},

	/**
	 * Subtracts given _8bit.Color to current color of the instance and
	 * returns the result as a new _8bit.Color instance.
	 *
	 * @param {_8bit.Color} c Color object
	 * @returns {_8bit.Color}
	 */
	sub: function(c) {
		return new _8bit.Color(this.r - c.r, this.g - c.g, this.b - c.b)
	},

	/**
	 * Returns a new _8bit.Color object holding the mixed
	 * values from this instance (full when t=0) and the given (full
	 * when t=1).
	 *
	 * @param {_8bit.Color} c - color to mix with
	 * @param {number} t - mix factor in the range [0.0, 1.0] where 0 = this instance, 1 = given color
	 * @returns {_8bit.Color}
	 */
	mix: function(c, t) {
		var r = this * t + c.r * (1 - t),
			g = this * t + c.r * (1 - t),
			b = this * t + c.r * (1 - t);

		return new _8bit.Color(r, g, b)
	},

	/**
	 * Multiplies given _8bit.Color to current color of the instance and
	 * returns the result as a new _8bit.Color instance.
	 *
	 * @param {Number} f - Multiplication factor
	 * @returns {_8bit.Color}
	 */
	mul: function(f) {
		return new _8bit.Color(this.r * f, this.g * f, this.b * f)
	},

	/**
	 * Bit-shifts current component values number of bit places given
	 * by bits to the right and returns the result as a new _8bit.Color
	 * instance.
	 *
	 * @param {Number} bits - Number of bits to shift
	 * @returns {_8bit.Color}
	 */
	rshift: function(bits) {
		return new _8bit.Color(this.r >> bits, this.g >> bits, this.b >> bits)
	},

	/**
	 * Bit-shifts current component values number of bit places given
	 * by bits to the left and returns the result as a new _8bit.Color
	 * instance.
	 *
	 * @param bits - Number of bits to shift
	 * @returns {_8bit.Color}
	 */
	lshift: function(bits) {
		return new _8bit.Color(this.r << bits, this.g << bits, this.b << bits)
	},

	/**
	 * Calculates a difference vector (non-squared) between the values
	 * of instance and the given color object.
	 *
	 * @param {_8bit.Color} c - Color object
	 * @returns {number} a number representing distance (non-squared)
	 */
	diff: function(c) {
		var dr = c.r - this.r,
			dg = c.g - this.g,
			db = c.b - this.b;
		return dr*dr + dg*dg + db*db
	},

	/**
	 * Calculates a difference vector (non-squared) between the values
	 * of instance and the given color object.
	 *
	 * @param {number} r - Color object
	 * @param {number} g - Color object
	 * @param {number} b - Color object
	 * @returns {number} a number representing distance (non-squared)
	 */
	diffRGB: function(r, g, b) {
		var dr = r - this.r,
			dg = g - this.g,
			db = b - this.b;
		return dr*dr + dg*dg + db*db
	},

	/**
	 * Calculates a difference vector (squared) between the values
	 * of instance and the given color object.
	 *
	 * @param {_8bit.Color} c - Color object
	 * @returns {number} a number representing distance (squared)
	 */
	diffSqrt: function(c) {
		return Math.sqrt(this.diff(c))
	},

	/**
	 * Returns a black or white color object depending on current color
	 * and threshold value. The current color is converted to a luma
	 * value and if below threshold a black color is returned, above a
	 * white color is returned
	 *
	 * @param {Number} t - Threshold value [0, 255] inclusive
	 * @returns {_8bit.Color}
	 */
	threshold: function(t) {
		var luma = this.r * 0.299 + this.g * 0.587 + this.b * 0.114;
		return luma >= t ? new _8bit.Color(255, 255, 255) : new _8bit.Color(0, 0, 0)
	},

	/**
	 * Inverts the current RGB and returns the result as a new
	 * _8bit.Color instance.
	 *
	 * @returns {_8bit.Color}
	 */
	invert: function() {
		return new _8bit.Color(255 - this.r, 255 - this.g, 255 - this.b)
	},

	/**
	 * Set new color values for this instance. Use this method instead of
	 * setting the RGB properties directly if you need the integer
	 * representation.
	 *
	 * @param {Number} r - red
	 * @param {Number} g - green
	 * @param {Number} b - blue
	 * @returns {_8bit.Color}
	 */
	setRGB: function(r, g, b) {

		this.r = r;
		this.g = g;
		this.b = b;
		this.int32 = this.rgb2int(r, g, b);

		return this
	},

	/**
	 *	Updates the current instance with new color value based on
	 *	the 32-bits integer value. The provided value must reflect the byte-
	 *	order of the system. Updates the RGB properties.
	 *
	 * @param {Number} i - Integer representation of a color.
	 * @returns {_8bit.Color}
	 */
	setInteger: function(i) {

		//i = i|0;

		var c = this.int2rgb(i);

		this.int32 = i;
		this.r = c[0];
		this.g = c[1];
		this.b = c[2];

		return this
	},

	/**
	 * Convert RGB values into an unsigned integer based on byte-order.
	 * On a MSB system (big endian) the order will be RRGGBBAA and for
	 * LSB (little endian) AABBGGRR (each char representing an octet).
	 * The alpha channel is ignored in 8-bit and is always treated
	 * as 0xff (opaque).
	 *
	 * @type {Function}
	 * @private
	 */
	rgb2int: function(r, g, b) {
		//todo can remove these parenthesis (dblcheck)
		return 0xff000000 | (b << 16) | (g << 8) | r
	},

	/**
	 * Convert RGB values into an unsigned integer based on byte-order.
	 * The byte-order (little endian) must be given as 0xAABBGGRR.
	 * (each char representing an octet and the color component). Alpha
	 * channel is ignored in 8-bit
	 *
	 * @param {Number} i - (unsigned) integer value to convert
	 * @returns {Array} Holding components for R (0), G (1) and B (2)
	 * @private
	 */
	int2rgb: function(i) {
		return [
			(i & 0xff),
			(i & 0xff00) >>> 8,
			(i & 0xff0000) >>> 16
			]
	},

	/**
	 * Returns the current RGB values as an Array.
	 *
	 * @returns {Array} Array with index 0 = red, 1 = green, 2 = blue
	 */
	toArray: function() {
		return [this.r, this.g, this.b]
	},

	/**
	 * Returns the current RGB values as an integer value.
	 *
	 * @returns {Number} 32-bits integer representing current color
	 */
	toInt: function() {
		return this.int32
	},

	/**
	 * Formats the current RGB values as a simple object with properties
	 * r, g, b holding the value for each component.
	 *
	 * @returns {{r: Number, g: Number, b: Number}}
	 */
	toObject: function() {
		return {
			r: this.r,
			g: this.g,
			b: this.b
		}
	},

	/**
	 * Formats the current RGB values as a comma-separated string.
	 *
	 * @returns {string} Simple comma-separated string
	 */
	toString: function() {
		return this.r + ',' + this.g + ',' + this.b
	},

	/**
	 * Formats the current RGB values as a string suitable for use
	 * with CSS and 2D context.
	 *
	 * @returns {string} CSS style compatible string
	 */
	toStyle: function() {
		return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')'
	},

	/**
	 * Returns an object with min and max properties containing new
	 * _8bit.Color objects adjusted for tolerance. Tolerance is a
	 * fraction of 255 which is subtracted and added to the new
	 * objects respectively. The values will in any case be maxed at 255
	 * and never be less than 0.
	 *
	 * @param {Number} tolerance - Tolerance in the range [0.0, 1.0]
	 * @returns {{min: _8bit.Color, max: _8bit.Color}}
	 */
	getToleranceRange: function(tolerance) {

		var c1, c2, i = 0;

		c1 = [this.r, this.g, this.b];
		c2 = [this.r, this.g, this.b];

		for(; i < 3; i++) {
			c1[i] -= (255 * tolerance + 0.5)|0;
			c2[i] += (255 * tolerance + 0.5)|0;

			if (c1[i] < 0) c1[i] = 0;
			if (c2[i] > 255) c2[i] = 255;
		}

		return {
			min: new _8bit.Color(c1[0], c1[2], c1[3]),
			max: new _8bit.Color(c2[0], c2[2], c2[3])
		}
	},

	clone: function() {
		return new _8bit.Color(this.r, this.g, this.b)
	}
};
