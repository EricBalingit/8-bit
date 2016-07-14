/*
	8-bit Style object
 */

_8bit.Style = function(palette, value, isStrict) {

	this.original = value;

	// Convert CSS name/definition to RGB values
	if (typeof value === "string") {
		this.color = palette.getNearestColor(_8bit.Color.fromCSS(value));
		this.style = this.color.toInt();
		this.type = _8bit.Style.type.solid;
	}

	else if (typeof value === "number" && isStrict) {
		throw "Using index requires strict to be set to false."
	}

	// Use an index (set strict = false)
	else if (typeof value === "number" && !isStrict) {
		value = Math.max(0, Math.min(palette.length - 1, value));
		this.color = palette.lut[value];
		this.style = palette._lutCache[value];
		this.type = _8bit.Style.type.solid;

	}

	// pattern
	else if (value instanceof _8bit.Pattern) {
		this.type = _8bit.Style.type.pattern;
	}

	// gradient
	else if (value instanceof _8bit.Gradient) {
		this.type = _8bit.Style.type.gradient;
	}

};

_8bit.Style.type = {
	solid: 0,
	pattern: 1,
	gradient: 2
};