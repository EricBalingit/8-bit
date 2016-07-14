/*
	8-bit Palette object
	© 2016 Epistemex
	www.epistemex.com
*/

/**
 * Creates a Palette object and initializes it with the LUT array
 * which contains sub-array or [_8bit.Color]{@link _8bit.Color}
 * objects for each RGB color spot in the palette:
 *
 * <code>[ [r0, g0, b0], [r1, g1, b1], ..., [rn, gn, bn]]</code>
 * <code>[ new _8bit.Color(r0, g0, b0), ..., new _8bit.Color(rn, gn, bn)]</code>
 *
 * When using name it will set a pre-defined (built-in) palette
 * based on retro computers. These are the available built-in palettes:
 *
 * <pre>
 * ACORN         - 16 colors palette
 * AMIGA         - 16 colors palette (Amiga default for 16 colors mode)
 * AMSTRADCPC    - 27 colors palette
 * APPLEII       - 16 colors palette
 * AQUARIUS      - 16 colors palette
 * ATARI2600NTSC - 128 colors palette
 * ATARI2600PAL  - 104 colors palette
 * BBC           - 8 colors palette
 * BW            - 2 colors palette (mono b&w monitors)
 * C16           - 128 colors palette
 * CBM64         - 16 colors palette
 * CBM64G        - 16 colors palette (gamma corrected)
 * CBMP4         - 121 colors palette
 * CGA           - 16 colors palette
 * EGA           - 64 colors palette
 * GAMEBOY       - 4 colors palette
 * G_DONKEY      - 6 color palette (Donkey Kong)
 * G_MARIO       - 16 color palette (Super Mario Bros.)
 * G_MONKEY      - 7 color palette (Monkey Island)
 * G_PACMAN      - 11 color palette (PacMan)
 * G_SPACEINV    - 9 color palette (Space Invaders)
 * G_ZELDA       - 16 color palette (The Legend of Zelda)
 * GREEN         - 2 colors palette (mono green colored monitors)
 * INTELLIVISION - 16 colors palette
 * MACII         - 16 colors palette
 * MSX           - 15 colors palette
 * MSX2          - 256 colors palette
 * NES           - 64 colors palette
 * SEGA          - 64 colors palette
 * TELETEXT      - 8 colors palette (for TV tele-text)
 * THOMSONMO5    - 16 colors palette
 * VIC20         - 16 colors palette
 * WIN16         - 16 colors palette
 * WIN20         - 20 colors palette
 * ZXSPECTRUM    - 16 colors palette
 * </pre>
 *
 * @example
 * var palette = new _8bit.Palette(array);
 * var palette = new _8bit.Palette('name');
 *
 * @class _8bit.Palette
 * @param {String|Array} palette - Name of a pre-defined palette or a Look-up-table (Array) consiting of integer values or sub-array with r, g and b values
 * @param {String} [name] - optional parameter for custom palette array
 * @returns {_8bit.Palette}
 * @constructor
 * @prop {Array} lut - Look-up-table for palette colors
 * @prop {String} name - name of palette given as optional name argument.
 * For internal palette its name in upper-case, or defaults to '<code>custom</code>'
 * @prop {Number} length - number of indexes in this palette
 */
_8bit.Palette = function(palette, name) {

	var i = 0, e;

	/**
	 * Contains _8bit.Color objects for each palette entry.
	 * @type {Array}
	 */
	this.lut = [];

	// predefined palette?
	if (typeof palette === "string") {

		palette = palette.toUpperCase();

		if (_8bit.Palettes[palette]) {
			name = palette;
			palette = _8bit.Palettes[palette];
		}
		else
			throw 'Unknown palette name ' + palette;
	}

	// parse and convert entries
	this.name = name || 'custom';

	// convert palette definitions into entries (array/Color)
	while(i < palette.length) {

		e = palette[i++];

		if (e instanceof _8bit.Color) {
			this.lut.push(e);
		}
		else if (typeof e === "number") {
			this.lut.push(new _8bit.Color(0xff000000 | e));
		}
		else {
			if (!Array.isArray(e)) throw 'Invalid palette array at index ' + --i;
			this.lut.push(new _8bit.Color(e[0], e[1], e[2]));
		}
	}

	this.length = this.lut.length;

	// Cache integer values of this palette
	this._lutCache = new Uint32Array(this.length);
	for(i = 0; e = this.lut[i];) this._lutCache[i++] = e.toInt();

};

_8bit.Palette.prototype = {

	/**
	 * Returns a _8bit.Color object from the color at index in the LUT.
	 *
	 * @param {Number} index - Color index of the current palette array
	 * @returns {_8bit.Color}
	 */
	getColor: function(index) {

		if (index < 0) index = 0;
		if (index >= this.length) index = this.length - 1;

		return this.lut[index]
	},

	/**
	 * Get index of color spot in the LUT Palettes if the RGB values
	 * matches 100% or by tolerance. Returns -1 if no index matched.
	 *
	 * Tolerance is given as percentage [0, 100], default is 0%
	 * or no tolerance.
	 *
	 * @param {Number} r - red
	 * @param {Number} g - green
	 * @param {Number} b - blue
	 * @param {Number} [tolerance] Tolerance in percentage
	 * @returns {number}
	 */
	getIndex: function(r, g, b, tolerance) {

		tolerance = ((tolerance || 0) * 2.55 + 0.5)|0;

		var	lut = this.lut,
			c,
			i = 0,
			rmin, rmax, gmin, gmax, bmin, bmax;

		if (tolerance === 0) {
			for(; c = lut[i]; i++)
				if (r === c.r && g === c.g && b === c.b) return i;

		}
		else {
			rmin = r - tolerance;	rmax = r + tolerance;
			gmin = g - tolerance;	gmax = g + tolerance;
			bmin = b - tolerance;	bmax = b + tolerance;

			rmin = Math.max(0, Math.min(255, rmin));
			rmax = Math.max(0, Math.min(255, rmax));
			gmin = Math.max(0, Math.min(255, gmin));
			gmax = Math.max(0, Math.min(255, gmax));
			bmin = Math.max(0, Math.min(255, bmin));
			bmax = Math.max(0, Math.min(255, bmax));

			for(; c = lut[i]; i++) {
				r = c.r;
				g = c.g;
				b = c.b;
				if (r >= rmin && r <= rmax &&
					g >= gmin && g <= gmax &&
					b >= bmin && b <= bmax)	return i;
			}
		}

		return -1;
	},

	/**
	 *	Get the index of the nearest color in the LUT based on RGB.
	 *	The function will always return a valid index.
	 *
	 * @param {_8bit.Color} color - color object
	 * @returns {number} The index of the closest color
	 */
	getNearestColor: function(color) {

		var i = 0, c, d,
			min = Number.MAX_VALUE,
			col,
			lut = this.lut;

		while(c = lut[i++]) {
			d = color.diff(c);
			if (d < min) {
				min = d;
				col = c
			}
		}

		return col
	},

	/**
	 *	Get the index of the nearest color in the LUT based on RGB.
	 *	The function will always return a valid index.
	 *
	 * @param {number} r - color object
	 * @param {number} g - color object
	 * @param {number} b - color object
	 * @returns {Array} The index of the closest color
	 */
	getNearestColorRGB: function(r, g, b) {

		var i = 0, c, d,
			min = Number.MAX_VALUE,
			col= 0,
			lut = this.lut;

		while(c = lut[i++]) {
			d = color.diffRGB(r, g, b);
			if (d < min) {
				min = d;
				col = c;
			}
		}

		return col;
	}

	/**
	 * Get a color object of the nearest color in the LUT based on RGB.
	 * The function will always return a valid color object.
	 *
	 * @param {_8bit.Color} color - color object
	 * @returns {_8bit.Color}
	 */
	/*getNearestColor: function(color) {
		return this.lut[this.getNearestIndex(color)]
	}*/

};

