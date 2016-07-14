8-bit
=====

##(ALPHA)

8-bit inspired HTML5 Canvas that allow you to draw palette based, non-aliased graphics.

Basically built from scratch using low-level methods to get that authentic
retro look from pixelated lines, palette based colors to image dithering 
and more.

Quickly build classic retro-styled games, sprite editors, 8-bit looking
graphics for your web page, drawing applications and so forth.


Features
--------

- Retro feel guaranteed!
- Free of anti-aliasing and smoothness!
- All methods are 100% argument compatible with regular 2D canvas
- All properties are 100% name compatible with regular 2D canvas
- Supports transformations
- Supports patterns
- Supports gradients
- Supports compositing modes
- Supports images (dithered and reduced to current palette)
- Dithering includes Floyd-Steinberg, Sierra and ordered.
- Converts client mouse positions to scale via event listeners
- Support new canvas features such as `imageSmoothingEnabled`, `imageSmoothingQuality`, `ellipse()`, `currentTransform()`, +++
- *(N/A) Supports text and bitmap fonts*
- Supports chainable methods
- Supports optional convenience methods (`line()`, `circle()`, `clear()`, and more) by disabling strict mode.
- Bundled with a ton (well, 35) of retro palettes based on actual retro-machines as well as some game specific palettes, incl. but not limited to C64, VIC20, Amstrad, ZX Spectrum, Atari, Mac, MSX, EGA, PacMan, +++
- *(N/A) Loads and bit-crushes audio files incl. low-pass filter and frequency reduction*

Includes separate 8-bit Image object to load and dither image on-the fly (you can still use regular Image objects).

Includes polyfills for regular 2D context to enable support for ellipse() etc. 

**Random image loaded and drawn**:

![http://i.imgur.com/msrnmzw.png](http://i.imgur.com/msrnmzw.png)

**Some test shapes to check even-odd fill mode composited on top**:

![http://i.imgur.com/uyuWAqc.png](http://i.imgur.com/uyuWAqc.png)


Install
-------

**8-bit** can be installed in various ways:

- Bower: `bower install 8-bit`
- NPM: `npm install -g 8-bit`
- Git using HTTPS: `git clone https://github.com/epistemex/8-bit.git`
- Git using SSH: `git clone git@github.com:epistemex/8-bit.git`
- Download [zip archive](https://github.com/epistemex/8-bit/archive/master.zip) and extract.
- [8-bit.min.js](https://raw.githubusercontent.com/epistemex/8-bit/master/8-bit.min.js)

No tape-loader, sorry!


Usage
-----

To use the canvas simply create an instance and knock yourselves out! The methods and properties
are the same as with 2D canvas, but using palette and low resolution instead.

    var canvas = document.getElementById("myCanvasElement");
    var ctx = canvas.getContext("8-bit");
    ...

**(N/A:)** For audio, simply load the audio file using the audio loader. The loaded audio is
then handed over to you on a silver plate which brings back the good old HIFI of the past
to your speakers.

More info coming later - star and follow to keep yourself updated!


Notes
-----

Although the calls are identical as to the ordinary 2D context, it do come
with some constraints due to either performance or other reasons such as
need for access to internal workings. For these reasons the following
object works only with the 8-bit context:

**These objects exist due to the need pre-processing and palette dithering:**

- _8bit.Image
- _8bit.Pattern
- _8bit.Gradient

You *can* use regular images (and video etc.) with the drawImage() method
but it will require the image source to be dithered on the fly which is
more performance hungry than using the _8bit.Image instance.

For patterns and gradients you won't notice much difference than with 2D
context as you will use the createPattern() and create*Gradient() methods.
You operate with them in the same way as before, but they are not 
interchangeable with ordinary 2D equivalent objects.

**These exist due to need for deep access (path data) and compatibility (matrix):**

- _8bit.Path2D
- _8bit.Matrix

There are others as well but they are marked as private.


Known Issues
------------

- non-zero winding not implemented yet (use "evenodd" fill mode to compare for now)
- In need of a ton of optimizations for image dithering, polygon fill etc.
- Not all features are documented yet. Refer to regular [2D context documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) as well as the included Quick Setup (see docs) for general usage.

Issues
------

See the [issue tracker](https://github.com/epistemex/8-bit/issues) for details.

It's currently in alpha so please be patient.


License
-------

More information will come later. Consider this a preview repository for 
the moment. Copyright reserved. Contact us directly (github@epistemex.com)
with questions about licensing and usage.


*&copy; Epistemex 2016*
 
![Epistemex](http://i.imgur.com/wZSsyt8.png)
