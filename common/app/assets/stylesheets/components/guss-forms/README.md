# Guss Forms

Part of the [Guss](https://github.com/guardian/guss) collection.

<http://guardian.github.io/guss-forms>

## Installation

```
bower install guss-forms --save
```

## Usage

```scss
@import "path/to/_forms.scss";
```

## Contribute

### Add a new form element

- Install Bower dependencies: `bower install --save`
- Add the element to the `demo/index.html` page
- Edit `_forms.scss`
- Compile styles using `sass demo/styles.scss:demo/styles.css`

### Commit and deploy

```bash
$ git commit -am "Commit message"
$ git checkout gh-pages
$ git merge -s subtree master
$ git push origin master gh-pages
```
