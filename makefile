# Lists all `make` targets.
help:
	@node tools/messages.js describeMakefile

# ********************************************************

# Watch and automatically reload all JS/SCSS.
# Uses port 3000 insead of 9000.
watch: compile-dev
	@npm run sass-watch & \
		npm run css-watch & \
		npm run browser-sync

# ********************************************************

atomise-css:
	@node tools/atomise-css

# Compile all assets for production.
compile: clean-assets
	@grunt compile-assets

# Compile all assets for development.
compile-dev: clean-assets
	@grunt compile-assets --dev

# ********************************************************

# Install all 3rd party dependencies.
install:
	@echo 'Installing 3rd party dependencies…'
	@npm install
	@echo '…done.'
	@echo 'Removing any unused 3rd party dependencies…'
	@npm prune
	@echo '…done.'
	@node tools/messages.js install

# Remove all 3rd party dependencies.
uninstall:
	@rm -rf node_modules
	@echo 'All 3rd party dependencies have been uninstalled.'

# Remove then reinstall all 3rd party dependencies.
# The nuclear option if nothing else has worked.
reinstall: uninstall install

# ********************************************************

# Run the JS test suite.
test:
	@grunt test --dev

# ********************************************************

# Lint all assets.
validate:
	@grunt validate

# Lint all SCSS.
validate-sass:
	@grunt validate:sass
	@grunt validate:css

# Lint all JS.
validate-js:
	@grunt validate:js

validate-amp:
	@cd tools/amp-validation && npm install && NODE_ENV=dev node index.js

# ********************************************************

# Shrinkwrap NPM packages.
shrinkwrap:
	@npm prune && npm shrinkwrap --dev && node dev/clean-shrinkwrap.js
	@node tools/messages.js did-shrinkwrap

# ********************************************************

# Deletes all asset build artefacts.
# Includes the builds themselves.
clean-assets:
	@rm -rf static/target static/hash static/requirejs

# ********************************************************

# * Not ready for primetime use yet... *
pasteup:
	@cd static/src/stylesheets/pasteup && npm --silent i && node publish.js
