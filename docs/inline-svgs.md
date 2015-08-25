# Inline SVGs

The use of inline SVGs is encouraged over BASE-64-encoded URLs in CSS. It means:

- the browser only has to parse what it needs, rather than all the images for the entire site on every page load
- the weight of the CSS is massively reduced (about 50kb gzipped in theory)
- images can be manipulated using CSS: you only need one outline SVG for each icon shape, for example.

The weight of images that are duplicated in a page (repeating icons etc) should largely be negated by gzipping.

## Adding a new image
Any image which you want to insert needs to be added to `/static/src/inline-svgs`. If the current directory structure doesn't fit the category or purpose of your new image, go ahead and add a new subdirectory. They're are only there to encourage a bit of order.

## Image preparation

All images in `inline-svgs` are run through SVGO before being inserted, so you can afford to leave useful comments etc. in a file if you want.

Make sure only double quotes (`"`) are used, include for attribute values. The requireJS plugin expects this and its’ string conconcatenation will fail if an `svg` source contains a single quote (`'`).

In order to stop IE8 from freaking out (even though it cannot even render SVGs), you *must* remove any `xmlns` attributes from the `svg` element.

Also, do ensure you set the viewport (`width` and `height` attributes) as well as the viewBox. The viewBox keeps it easily scalable (`viewBox="x y width height"`).

Since you can target an inline SVG from CSS, remove all the `fill` etc. attributes you can.

## Inserting an image

There are two places where you can use an inline SVG: Scala templates and JavaScript templates. They have similar but slightly different APIs.

### Scala templates

A scala helper method will insert the image for you:

```scala
@fragments.inlineSvg(Filename[, path: Subdirectory[, classes: Classes[, title: Title]]])
```

- `Filename` **String** The name of the file, excluding the extention
- `Subdirectory` **String** (optional) The folder the image lives in inside `inline-svgs`
- `Classes` **List** (optional) A list of bespoke classes for this image
- `Title` **String** (optional) A title that gets added to the wrapping `span`

### JavaScript templates

These are a bit more complex. To ensures they only appear in the source once, all SVGs that will be used in a JavaScript template need to be added to `static/src/javascripts/projects/common/views/svgs.js`:

```javascript

// common/views/svgs.js
define([
    'inlineSvg!svgs/Filename',
    'inlineSvg!svgs/Filename2!Subdirectory'
], function (
    myImage,
    myOtherImage
) {
    var svgs = {
        myImage: myImage,
        myOtherImage: myOtherImage
    };
    // other code hidden...
});
```

- `Filename` **String** The name of the file, excluding the extention
- `Subdirectory` **String** (optional) The folder the image lives in within `inline-svgs/`, prefixed by a `!`

Then in the file that will use the template, require `svgs.js`:

```javascript
// myfile.js
define([
    'common/views/svgs',
], function (
    svgs
) { ... })
```
This returns a look-up method to pull icons out of the `svgs` object in `svgs.js`, which can then be passed into templates. The method takes an optional array of classes, like the Scala helper:

```javascript
// myfile.js
define([
    'common/utils/template',
    'common/views/svgs'
], function (
    template,
    svgs
) {
	var htmlWithInlineSVG = template("Here is my inline image: {{myImage}}", {
		myImage: svgs('myImage'[, Classes[, Title]])
	})
})
```
- `Classes` **Array** (optional) An array of bespoke classes for this image
- `Title` **String** (optional) A title that gets added to the wrapping `span`

## Output

The result of inserting an SVG with either method is the compressed source wrapped inside a `span`, with some default classes for free, plus any extra you've specified.

So both this Scala:

```scala
@fragments.inlineSvg("profile-36", "icon", List("rounded-icon", "control__icon-wrapper"), Some("Profile icon"))
```
and this JavaScript:

```javascript
// common/views/svgs.js
define([
    'inlineSvg!svgs/profile-36!icon'
], function (
    profile36icon
) {
    var svgs = {
        profile36icon: profile36icon
    };
});
```
```javascript
// myfile.js
define([
    'common/views/svgs'
], function (
    svgs
) {
	svgs('profile36icon', ["rounded-icon", "control__icon-wrapper"], "Profile icon");
});
```

will give you this HTML:

```html
<span title="Profile icon" class="inline-profile-36 inline-icon rounded-icon control__icon-wrapper">
    <svg width="18" height="18"><path d="..."></path></svg>
</span>
```

## Defaults
The following CSS is also applied to certain image categories by default.

```css
.inline-icon {
	fill: #ffffff;
}
```
