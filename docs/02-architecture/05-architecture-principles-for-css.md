# Architecture principles for CSS

We're aiming to stick to Jonathan Snook's [SMACSS](http://www.smacss.com) principles for structuring our CSS. This is already in use in Pasteup and it makes good sense to use it here, too.

Here's a summary of the SMACSS principles, divided by its rule types (base, layout, module, state and theme). Note: this is written by me (Matt) based on Jonathan's book.

## base rules
* default, single-element selectors
* could just be a reset stylesheet

## layout rules
* divide the page into sections, holding modules together
* **prefix**: l-, eg: `l-inline`, `l-stacked`, or semantically clear things like `grid-5`


## module rules
* reusable, modular parts of designs
* should each exist as a standalone component
* avoid conditional styling based on location
* if you need this, sub-class the module
* **prefix**: group related modules. eg `.ex` for example, `.ex-caption` for example's captions

## state rules
* describe modules/layouts in particular states or views
* indicate a javascript dependency
* probably require use of `!important`
* includes media queries
* hidden, expanded, active, inactive? mobile? tablet? tv? widescreen? fridge?
* **prefix**: `is-`, eg: `.is-hidden`, `.is-tablet`

## theme rules
* similar to state, but perhaps more visual (internationalisation, maybe? uk/us variations, arabic? LTR etc)

