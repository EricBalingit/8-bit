/*!
	8-bit ver 0.4.0 alpha
	(c) 2013-2016 Epistemex
	www.epistemex.com
	Copyrighted. Preview version! No license given at this point.
*/

/**
 * @name 8-bit Context for HTML5 Canvas.
 * @copyright Copyright &copy; 2013-2016 Epistemex
 * @license TBA
 */

/**
 * Creates a new 8-bit context instance which handles all operations
 * with the canvas bitmap.
 *
 * @param {HTMLCanvasElement} canvas - Canvas element to use
 * @param {*} options - option object, empty literal as minimum
 * @param {*} [options.palette=Palettes.CBM64] - Palette to use. You can use custom palette files if you wish.
 * @constructor
 */
function _8bit(canvas, options) {

	"use strict";


	var me = this,

		w = isNum(options.width) ? options.width : canvas.dataset.width || 320,		// internal width
		h = isNum(options.height) ? options.height : canvas.dataset.height || 240,	// internal height

		_ctx = canvas.getContext("2d", {alpha: false}),					// display context

		intRender = new _8bit.Shaders.Pixelated(w, h, true),			// internal renders, take local composite mode
		tmpRender = new _8bit.Shaders.Pixelated(w, h),
		supportsAlpha = _8bit.utils.contextSupportAlphaOption(),

		stack,															// save/restore stack
		state,
		matrix,															// internal matrix
		iPath,															// internal path (first initialized in init)
		palette,

		styleDest = {
			stroke: 0,
			fill: 1,
			bg: 2
		},

		noop = function(){};


	if (!_ctx) return;
	canvas.__is8 = true;

	/*------------------------------------------------------------------

		Public properties

	------------------------------------------------------------------*/

	/**
	 * If true (default) only properties and methods 100% compatible with
	 * 2D canvas can be used. If false, the convenience methods such as
	 * line() etc. will become available, but will break compatibility
	 * with 2D context if you at one point want to switch back.
	 * @type {boolean}
	 */
	this.strict = true;

	/**
	 * Horizontal and vertical aspect ratios between display canvas and
	 * internal bitmap. You can use this to multiply your display scaled
	 * elements to get the internal bitmap coordinates, or use the inverse
	 * to go from internal bitmap to display coordinates.
	 *
	 * @type {{x: number, y: number}}
	 */
	this.aspect = {};

	def("canvas", function() {return intRender.canvas});
	def("displayCanvas", function() {return canvas});
	def("displayWidth", function(){return canvas.width});
	def("displayHeight", function(){return canvas.height});
	def("width", function(){return w});
	def("height", function(){return h});
	def("ctx", function() {return _ctx});

	def("globalAlpha", function() {return 1}, noop);
	def("globalCompositeOperation", function() {return intRender.ctx.globalCompositeOperation}, setCompMode);
	def("imageSmoothingEnabled", function() {return state.imageSmoothingEnabled}, function(s) {state.imageSmoothingEnabled = !!s});
	def("imageSmoothingQuality", function() {return state.imageSmoothingQuality}, function(s) {
		if (["low", "medium", "high"].indexOf(s) > -1) state.imageSmoothingQuality = s;
	});

	def("strokeStyle", function() {return state.styles[styleDest.stroke].original}, function(s) {setStyle(s, styleDest.stroke)});
	def("fillStyle", function() {return state.styles[styleDest.fill].original}, function(s) {setStyle(s, styleDest.fill)});
	def("bgStyle", function() {return state.styles[styleDest.bg].original}, function(s) {setStyle(s, styleDest.bg)});
	def("palette", function() {return palette}, setPalette);

	def("lineWidth", function() {return state.lineWidth}, noop);
	def("lineCap", function() {return state.lineCap}, noop);
	def("lineJoin", function() {return state.lineJoin}, noop);
	def("lineDashOffset", function() {return state.lineDashOffset}, noop);
	def("miterLength", function() {return state.miterLength}, noop);

	def("font", function() {return state.font}, noop);
	def("textAlign", function() {return state.textAlign}, noop);
	def("textBaseline", function() {return state.textBaseline}, noop);

	def("shadowOffsetX", function() {return state.shadowOffsetX}, noop);
	def("shadowOffsetY", function() {return state.shadowOffsetY}, noop);
	def("shadowBlur", function() {return state.shadowBlur}, noop);
	def("shadowColor", function() {return state.shadowColor}, noop);


	/*------------------------------------------------------------------

		Public methods

	------------------------------------------------------------------*/

	this.save = function() {
		stack.push(state);
		state = new _8bit.State(palette, state);
		return me
	};

	this.restore = function() {
		var s = stack.splice(stack.length - 1)[0];
		if (s) {
			state = s;
			matrix = state.matrix;
		}
		return me
	};

	this.createPattern = function(img, repeat) {
		return new _8bit.Pattern(img, repeat, me)
	};

	this.createLinearGradient = function(x1, y1, x2, y2) {
		return new _8bit.Gradient("l", {x1:x1, y1:y1, x2:x2, y2:y2}, me)
	};

	this.createRadialGradient = function(x1, y1, r1, x2, y2, r2) {
		return new _8bit.Gradient("r", {x1:x1, y1:y1, r1:r1, x2:x2, y2:y2, r2:r2}, me)
	};


	/*------------------------------------------------------------------

		Path methods - shares _8bit.Path2D methods

	------------------------------------------------------------------*/

	this.beginPath = function() {
		iPath = new _8bit.Path2D(matrix);
		return this
	};

	this.closePath = function() {iPath.closePath(); return me};
	this.moveTo = function(x, y) {iPath.moveTo(x, y); return me};
	this.lineTo = function(x, y) {iPath.lineTo(x, y); return me};
	this.arc = function(x, y, r, sa, ea, ccw) {iPath.arc(x, y, r, sa, ea, !!ccw); return me};
	this.arcTo = function() {iPath.arcTo.apply(iPath, arguments); return me};
	this.rect = function(x, y, w, h) {iPath.rect(x, y, w, h); return me};
	this.ellipse = function() {iPath.ellipse.apply(iPath, arguments); return me};
	this.bezierCurveTo = function(cx1, cy1, cx2, cy2, x2, y2) {iPath.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2); return me};
	this.quadraticCurveTo = function(cx, cy, x, y) {iPath.quadraticCurveTo(cx, cy, x, y); return me};

	this.stroke = function(path) {
		tmpRender.stroke((path || iPath).paths, state, me);
		tmpRender.drawToRender(intRender);
		intRender.drawToCtx(_ctx, canvas.width, canvas.height);
		return me
	};

	this.fill = function(path, type) {
		// todo only evenodd is supported for now
		if (isStr(path)) {
			type = path;
			path = null;
		}
		tmpRender.fill((path || iPath).paths, state, me, type || "nonzero");
		tmpRender.drawToRender(intRender);
		intRender.drawToCtx(_ctx, canvas.width, canvas.height);
		return me
	};

	this.clip = function() {
		//todo clip()
	};

	/*------------------------------------------------------------------

		Non-Path methods - draws directly to canvas

	------------------------------------------------------------------*/

	this.drawImage = function(img, x, y, w, h, dx, dy, dw, dh) {

		x |= 0;
		y |= 0;

		if (isNum(w)) {
			w |= 0; h |= 0
		}

		if (isNum(dx)) {
			dx |= 0; dy |= 0;
			dw |= 0; dh |= 0
		}

		var idata;

		if (img instanceof HTMLImageElement) {
			if (arguments.length === 9) {
				var tmp = _8bit.utils.getContext(dw, dh, true);
				tmp.drawImage(img, x, y, w, h, 0, 0, dw, dh);
				x = dx;
				y = dy;
				w = dw;
				h = dh;
				idata = _8bit.Image.convert(tmp.canvas, w, h, me);

			}
			else {
				idata = img.__8bit || _8bit.Image.convert(img, w || img.naturalWidth || img.width, h || img.naturalHeight || img.height, me);
			}

			//todo auto GC cache after 10s or so using closure and timer
			img.__8bit = idata;
		}
		else if (img instanceof HTMLVideoElement) {
			idata = _8bit.Image.convert(img, w || img.videoWidth || img.width, h || img.videoHeight || img.height, me);
		}
		else if (img instanceof _8bit.Image) {
			idata = img.bitmap
		}

		tmpRender.drawImage(idata, state, x, y);
		tmpRender.drawToRender(intRender);
		intRender.drawToCtx(_ctx, canvas.width, canvas.height);
	};

	this.createImageData = function(w, h) {
		return intRender.ctx.createImageData(w, h)
	};

	this.getImageData = function(x, y, w, h) {
		return intRender.ctx.getImageData(x, y, w, h)
	};

	this.putImageData = function(idata, x, y) {
		intRender.ctx.putImageData(idata, x, y);
		return me
	};

	this.clearRect = function(x, y, w, h) {
		// We provide state to the clear method as we will clear the
		// intermediate renderer and not temp. This in order to correctly
		// apply current transformations..
		intRender.clearRect(x, y, w, h, state);
		intRender.drawToCtx(_ctx, canvas.width, canvas.height);
		return me
	};

	this.strokeRect = function(x, y, w, h) {
		var path = new _8bit.Path2D(matrix);
		path.rect(x, y, w, h);
		path.closePath();
		me.stroke(path);
		return me
	};

	this.fillRect = function(x, y, w, h) {
		var path = new _8bit.Path2D(matrix);
		path.rect(x, y, w, h);
		path.closePath();
		me.fill(path);
		return me
	};

	/*------------------------------------------------------------------

		Text methods - uses bitmap in our case

	------------------------------------------------------------------*/

	this.fillText = noop;
	this.strokeText = noop;
	this.measureText = noop;

	/*------------------------------------------------------------------

		Transformation Matrix

	------------------------------------------------------------------*/

	this.getTransform = function() {return matrix};
	this.setTransform = function(a,b,c,d,e,f) {matrix.setTransform(a,b,c,d,e,f); return me};
	this.transform = function(a,b,c,d,e,f) {matrix.transform(a,b,c,d,e,f); return me};
	this.rotate = function(a) {matrix.rotate(a); return me};
	this.translate = function(x, y) {matrix.translate(x, y); return me};
	this.scale = function(sx, sy) {matrix.scale(sx, sy); return me};
	this.resetTransform = function() {matrix.reset(); return me};

	/*------------------------------------------------------------------

		Convenience Methods (set strict = false):

	------------------------------------------------------------------*/

	this.resetClip = function() {
		if (!notStrict()) {
			// todo resetClip()
		}
	};

	this.createConicalGradient = function(cx, cy, rot) {
		if (!notStrict()) {
			// todo createConicalGradient()
		}
	};

	this.circle = function(cx, cy, r) {
		if (notStrict()) {
			me.moveTo(cx + r, cy);
			me.arc(cx, cy, r, 0, Math.PI*2);
			me.closePath()
		}
		return me
	};

	this.line = function(x1, y1, x2, y2) {
		if (notStrict()) {
			me.moveTo(x1, y1);
			me.lineTo(x2, y2)
		}
		return me
	};

	this.roundRect = function(x, y, w, h, r) {
		if (notStrict()) {
			if (w - r*2 < 0) r = w * 0.5;
			if (h - r*2 < 0) r = h * 0.5;

			if (r <= 0) return me.rect(x, y, w, h);
			else {
				me.moveTo(x + w, y + h - r);
				me.arc(x + w - r, y + h - r, r, 0, Math.PI*0.5);			// br
				me.arc(x + r, y + h - r, r, Math.PI*0.5, Math.PI);			// bl
				me.arc(x + r, y + r, r, Math.PI, -Math.PI*0.5);				// ul
				me.arc(x + w -r, y + r, r, -Math.PI * 0.5, 0);				// ur
				me.closePath()
			}
		}
		return me
	};

	this.clear = function() {
		if (notStrict()) me.clearRect(0, 0, w, h);
		return me
	};

	/*------------------------------------------------------------------

		PRIVATE METHODS

	------------------------------------------------------------------*/

	function setStyle(s, dst) {
		state.styles[dst] = new _8bit.Style(palette, s, me.strict)
	}

	function setPalette(p) {
		palette = new _8bit.Palette(p)
	}

	function setCompMode(m) {
		var modes = [
				"source-over", "source-in", "source-out", "source-atop",
				"destination-over", "destination-in", "destination-out", "destination-atop",
				"xor", "copy"],
			i = modes.indexOf(m);

		if (i > -1) {
			intRender.ctx.globalCompositeOperation = m
		}
	}

	/*------------------------------------------------------------------

		INIT

	------------------------------------------------------------------*/

	function init() {

		// display canvas
		disableSmoothing();

		if (!supportsAlpha)
			_ctx.globalCompositeOperation = "copy";  // only needed if context option alpha isn't supported

		// this context
		me.palette = options.palette || _8bit.Palettes.CBM64;

		stack = [];
		state = new _8bit.State(palette);
		matrix = state.matrix;

		me.aspect = {
			x: w / canvas.width,
			y: h / canvas.height
		};

		// init first path
		me.beginPath();
		me.clearRect(0, 0, w, h)
	}

	init();
	canvas.addEventListener("resize", init);

	/*------------------------------------------------------------------

		"ALL YOUR BASE ARE BELONG TO US!" (or system patches/"takeovers"

	------------------------------------------------------------------*/

	// cross-patch
	canvas.toDataURL = intRender.canvas.toDataURL.bind(intRender.canvas);
	canvas.toBlob = intRender.canvas.toBlob.bind(intRender.canvas);

	canvas.__8ael = canvas.addEventListener;
	canvas.__8rel = canvas.removeEventListener;

	canvas.addEventListener = function(name, func, f) {

		var cb = func.bind(canvas);

		function callback(e) {
			if (e instanceof MouseEvent) {
				cb(new _8bit.MouseEvent(canvas, me, e))
			}
			else
				cb(e)
		}

		canvas.__8ael(name, callback, f);

		// set internally as we need access to callback wrapper, and
		// there is no need for remEL before addEL.
		canvas.removeEventListener = function(name, func, f) {
			canvas.__8rel(name, callback, f)
		}
	};

	/*------------------------------------------------------------------

		HELPER METHODS

	------------------------------------------------------------------*/

	// turn off image smoothing for display canvas
	function disableSmoothing() {
		_8bit.utils.disableSmoothing(_ctx)
	}

	function notStrict() {
		if (me.strict)
			console.warn("context.strict must be set to false for this method to work.");

		return !me.strict
	}

	function isNum(o) {return typeof o === "number"}
	function isBool(o) {return typeof o === "boolean"}
	function isStr(o) {return typeof o === "string"}

	function def(name, getter, setter) {
		Object.defineProperty(me, name, setter ? {get: getter, set: setter} : {get: getter});
	}
}

_8bit.Shaders = {};


/**
 * Use this global constant or variable to disable patching of the
 * system's HTMLCanvasElement and CanvasRenderingContext2D if you so prefer.
 * Must be set to true **before** 8bit is loaded.
 *
 * The alternative way to create an 8-bit instance is:
 *
 *     var ctx = new _8Bit(canvas, options);
 *
 * The patch is provided for convenience and will not cause any problems
 * or interruptions.
 *
 * @const NO8BITPATCH
 * @type {boolean}
 */
if (typeof NO8BITPATCH === "undefined") {

	/**
	 *	This canvas extension allow this use:
	 *
	 *		var retro = canvas.getContext('8-bit');    // or "8bit"
	 *
	 * This allow developer to change minimal of existing code as the methods
	 * and properties are compatible. Only size and a palette needs to be
	 * changed.
	 *
	 *	@private
	 */
	window.HTMLCanvasElement.prototype.___8GC = window.HTMLCanvasElement.prototype.getContext;
	window.HTMLCanvasElement.prototype.getContext = function(type, options) {

		if (type.toLowerCase().replace("-", "") === '8bit') {
			var ctx = new _8bit(this, options || {});
			return this.__is8 ? ctx : null
		}
		else
			return this.___8GC(type, options);
	};

	HTMLCanvasElement.prototype.___8PSC = HTMLCanvasElement.prototype.probablySupportsContext || null;
	HTMLCanvasElement.prototype.probablySupportsContext = function(type) {
		if (type.toLowerCase().replace("-", "") === '8bit') return true;	// !note does not take into account low resources
		if (this.___8PSC)
			return this.__is8 ? false : this.___8PSC.apply(this, arguments);
		else
			return !this.__is8 && this.getContext.apply(this, arguments) !== null
	}
}

