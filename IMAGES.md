# Images

## How are trail pictures picked in Frontend?

### Default behaviour
1. Use the trail pic (known in content api as 'image element with thumbnail relation') if it has width >= 460.
2. Use the main picture.
3. Use the image from the first embedded video
4. Fall back to small trail pic.

### Galleries
1. Use the thumbnail.

### Facia cards
1. Use the Image override.
2. If the card is a Gallery, use the Gallery behaviour.
2. Use the Default behaviour.