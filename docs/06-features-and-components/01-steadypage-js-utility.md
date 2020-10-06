# SteadyPage JS utility

[Steadypage](https://github.com/guardian/frontend/blob/main/static/src/javascripts/projects/common/utils/steady-page.js) is a utility designed to improve the user experience when inserting lazy loaded elements into the page. It will measure the height (including margins, padding etc) of a container immediately after insertion and then add that height to the original scroll position to move the page back to where the user was.

Before             |  After
:-------------------------:|:-------------------------:
![jumping comments - comment block - mob - before](https://cloud.githubusercontent.com/assets/638051/16763538/24e4d2c8-4821-11e6-8a4b-62d0c08cb354.gif) | ![jumping comments - comment block - mob - after](https://cloud.githubusercontent.com/assets/638051/16763543/2d79db72-4821-11e6-88a1-a9f9f05fb277.gif)

## Fastdom

**Do not use fastdom** when inserting elements with steady page. The utility uses fastdom under the hood to read and write where required. It batches the insertion of elements, so that if multiple elements are queued in the same animation frame they will be inserted in the same fastdom.mutate and the position scrolled once to prevent excessive page jumping.

It is not a direct replacement for fastdom as it requires the context of the element being passed in, in the form of its measurable container - the height of which must be the change of scroll position.

## Spacef(iller|inder)

When using spacefiller, you'll need to provide an empty writer in place of fastdom as we want to override the default usage of fastdom.

```
spaceFiller.fillSpace(rules, insertElement, {
	domWriter: function (writerCallback) {
 		return writerCallback();
	}
});
```

## Use at the point of insertion

We use steady page at the point of element insertion - e.g when appending to a paragraph returned from space filler, you need to create the container/element ready to insert into the page so that we're able to pass the element whose height will match the distance the page scroll needs to be adjusted.

```
function insertElement(para) {
	var elementContainer = createElement();

	// Pass the container created in memort, with the element inside
	// and the callback needed to insert it into the page at the right
	// location
	steadyPage.insert(element, function() {
		para.parentNode.insertBefore(element, para)
	});
}
```

## Limitations

### Doesn't wait for images or async

You must set the height of the container being measured in CSS if there are any images or other async content loaded into the container you're measuring that will change the height again - the container is only measured and adjusted at the point of insertion, not at 'fully loaded'.

### Full width elements

Steady page only handles the insertion of elements that take up the entire width of the article or page container - e.g outbrain, ads at the the mobile breakpoint. It does not deal, currently, with the insertion of elements that content wraps around as the height of the containers does not directly equate to the scroll distance moved.
