/*
	8-bit utils
	© 2016 Epistemex
	www.epistemex.com
*/
_8bit.utils = {

	getContext: function(w, h, noAlpha) {
		var c = document.createElement("canvas");
		c.width = w;
		c.height = h;
		return c.getContext("2d", {alpha: !noAlpha})
	},

	contextSupportAlphaOption: function() {
		return document.createElement("canvas").getContext("2d", {alpha: false}).getImageData(0,0,1,1).data[3] === 255
	},

	disableSmoothing: function(ctx) {
		var px = ["i", "webkitI", "mozI", "msI", "oI", "khtmlI"], i = 0, p;
		while(p = px[i++]) {
			if (typeof ctx[p + "mageSmoothingEnabled"] !== "undefined") {
				ctx[p + "mageSmoothingEnabled"] = false;
				break
			}
		}
	}

};