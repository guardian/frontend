# Pasteup Forms

Part of the [Pasteup-forms](https://github.com/guardian/pasteup) collection.

<http://guardian.github.io/pasteup-forms>

## Installation

```
bower install pasteup-forms --save
```

## Usage

```scss
@import 'path/to/_forms.scss';

@include pasteup-forms-fix-ie8-password-field-webfonts-display;
@include pasteup-forms-defaults;
```

## Contribute

### Add a new form element

- Install Bower dependencies: `bower install --save`
- Add the element to the `demo/index.html` page
- Edit `_forms.scss`
- Compile styles using `sass demo/demo.scss:demo/demo.css`

### Commit and deploy

```bash
$ git commit -am "Commit message"
$ git checkout gh-pages
$ git merge -s subtree master
$ git push origin master gh-pages
```
