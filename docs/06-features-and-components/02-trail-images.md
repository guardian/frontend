# How are trail pictures picked in Frontend?

Use the rules below like a filter to narrow down the content api response into a list of candidate images.
From the candidate images, choose the master 5:3 image, the largest 5:3 image and the smallest 5:3 image with a width >= 460. At render time we select from these based on whether using the resizing service.

## Default rules
1. Use the trail pic (known in content api as 'image element with thumbnail relation'), if it contains an image with width >= 460.
2. Use the main picture.
3. Use the image from the first embedded video
4. Fall back to small trail pic.

## For a Gallery
1. Only use the thumbnail.

## For a Facia card
1. Use the Image override if specified.
2. If the card is a Gallery, use the Gallery behaviour.
3. Use the default rules.
