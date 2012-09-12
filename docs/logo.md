Logo management
---------------

What we want :-

- Users with no CSS or Javascript will see a plain text logo reading _The Guardian_.
- Users with CSS will display a 120px wide PNG, or if SVG is supported a 120px SVG.
- Users with CSS3 & SVG & JavaScript will see a SVG graphic that scales as the viewport grows, and because this is SVG the larger image incurs no additional file size.

Producing a PNG from SVG
------------------------

The source image is in SVG form, exported from Illustrator or some such.

I used [Batik](http://xmlgraphics.apache.org/batik/) to convert it to a PNG..

Download the Apache Batik SVG library and use the rasterizer tool as follows :-

```
java -jar batik-rasterizer.jar -w 120 common/app/assets/images/guardian-logo.svg
```

It will create a 120px width PNG called _guardian-logo.png_.

Making a base64 string
----------------------

In the CSS we want a base64 SVG file, so find a language that can do that. 

In Ruby, this will do :-

```
ruby -e 'require "base64"; p Base64.encode64(STDIN.read).gsub!("\n", "")' < guardian-logo.svg
```

I then copy the output to my clipboard and set a background-image containing the data uri :-

```
background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iM....
```

PNG optimisation
----------------

Batik doesn't really optimise the PNG it produces, so for bonus points we'll shave ~30% off it's size.

[PNGCrush](http://pmt.sourceforge.net/pngcrush/) works for me. Use it like this :-

```
pngcrush guardian-logo.png guardian-logo-crushed.png
```

Referencing the PNG from CSS
----------------------------

Play Framework uses an md5 hash of the file as it's cache id.

We need to get that ... 

```
md5 app/assets/images/guardian-logo.png
```

... then reference it in the CSS :-

```
background-image: url('../../assets/images/guardian-logo.5f7d1bda6dfb728f0fa2d56c18c339a5.png');
```

