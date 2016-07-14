/*
	Various polyfills made for 8-bit, but can be used without as well.
	© 2016 Epistemex
	www.epistemex.com
*/

CanvasRenderingContext2D.prototype.ellipse =
	CanvasRenderingContext2D.prototype.ellipse || function(cx, cy, rx, ry, rot, sa, ea, ccw) {

		sa = sa % (Math.PI*2);
		ea = ea % (Math.PI*2);
		if (rx < 0 || ry < 0)
			throw new RangeError("IndexSizeError: Radius is negative.");

		var step = 0.002,
			cos = Math.cos(rot),
			sin = Math.sin(rot),
			ex, ey;

		if (ccw) {
			if (sa < ea) ea -= Math.PI*2;
			for(; sa >= ea; sa -= step) {
				ex = rx * Math.cos(sa);
				ey = ry * Math.sin(sa);
				this.lineTo(
					cx + cos * ex - sin * ey,
					cy + sin * ex + cos * ey
				)
			}
		}
		else {
			if (sa > ea) ea += Math.PI*2;
			for(; sa <= ea; sa += step) {
				ex = rx * Math.cos(sa);
				ey = ry * Math.sin(sa);
				this.lineTo(
					cx + cos * ex - sin * ey,
					cy + sin * ex + cos * ey
				)
			}
		}
	};


CanvasRenderingContext2D.prototype.circle =
	CanvasRenderingContext2D.prototype.circle || function(x, y, r) {
		this.moveTo(x + r, y);
		this.arc(x, y, r, 0, Math.PI*2);
		this.closePath()
	};

CanvasRenderingContext2D.prototype.line =
	CanvasRenderingContext2D.prototype.line || function(x1, y1, x2, y2) {
		this.moveTo(x1, y1); this.lineTo(x2, y2)
	};

CanvasRenderingContext2D.prototype.clear =
	CanvasRenderingContext2D.prototype.clear || function() {
		this.clearRect(0, 0, this.canvas.width, this.canvas.height)
	};

CanvasRenderingContext2D.prototype.roundRect =
	CanvasRenderingContext2D.prototype.roundRect || function(x, y, w, h, r) {

		var me = this;

		if (w - r*2 < 0) r = w * 0.5;	// todo check these...
		if (h - r*2 < 0) r = h * 0.5;

		if (r <= 0) me.rect(x, y, w, h);
		else {
			me.moveTo(x + w, y + h - r);
			me.arc(x + w - r, y + h - r, r, 0, Math.PI*0.5);			// br
			me.arc(x + r, y + h - r, r, Math.PI*0.5, Math.PI);			// bl
			me.arc(x + r, y + r, r, Math.PI, -Math.PI*0.5);				// ul
			me.arc(x + w -r, y + r, r, -Math.PI * 0.5, 0);				// ur
			me.closePath()
		}
	};

