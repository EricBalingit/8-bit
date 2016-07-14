/*
	MouseEvent for addEventListener on main canvas
	(c) 2016 Epistemex
	www.epistemex.com
*/

_8bit.MouseEvent = function(canvas, ctx, e) {

	var rect = canvas.getBoundingClientRect(),
		x = e.clientX - rect.left,
		y = e.clientY - rect.top,
		aspect = ctx.aspect;

	this.x = (x * aspect.x)|0;
	this.y = (y * aspect.y)|0;
	this.clientX = rect.left + this.x;
	this.clientY = rect.top + this.y;
	this.altKey = e.altKey;
	this.button = e.button;
	this.buttons = e.buttons;
	this.ctrlKey = e.ctrlKey;
	this.metaKey = e.metaKey;
	this.shiftKey = e.shiftKey;
	this.relatedTarget = e.relatedTarget;

	this.target = e.target;
	this.currentTarget = e.currentTarget;
	this.eventPhase = e.eventPhase;
	this.timeStamp = e.timeStamp;
	this.type = e.type;
	this.isTrusted = true;
	this.bubbles = e.bubbles;
	this.cancelable = e.cancelable;

	this.preventDefault = e.preventDefault.bind(e);
	this.stopPropagation = e.stopPropagation.bind(e);
	this.stopImmediatePropagation = e.stopImmediatePropagation.bind(e);

	//this.defaultPrevented  todo this must be set from within the preventDefault() call

	this.originalEvent = e;

	this.region = null;			// todo hit-region support (iterate paths)

};