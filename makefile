# Targets marked '# PRIVATE' will be hidden when running `make help`.
# They're helper targets that you probably only need to know about
# if you've got as far as reading the makefile.

# Lists common targets.
# Also the default task (`make` === `make help`).
help: # PRIVATE
	@node tools/messages.js describeMakefile

# Lists *all* targets.
list: # PRIVATE
	@node tools/messages.js describeMakefile --all



# *********************** SETUP ***********************

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
uninstall: # PRIVATE
	@rm -rf node_modules
	@echo 'All 3rd party dependencies have been uninstalled.'

# Reinstall all 3rd party dependencies from scratch.
# The nuclear option if `make install` hasn't worked.
reinstall: uninstall install



# *********************** DEVELOPMENT ***********************

# Watch and automatically compile/reload all JS/SCSS.
# Uses port 3000 insead of 9000.
watch: compile-dev
	@npm run sass-watch & \
		npm run css-watch & \
		npm run browser-sync

# Shrinkwrap NPM packages after updating package.json.
shrinkwrap: # PRIVATE
	@npm prune && npm shrinkwrap --dev && node dev/clean-shrinkwrap.js
	@node tools/messages.js did-shrinkwrap



# *********************** ASSETS ***********************

# Compile all assets for production.
compile: clean-assets
	@grunt compile-assets

# Compile all assets for development.
compile-dev: clean-assets
	@grunt compile-assets --dev

# Delete all asset build artefacts, includes the builds themselves.
clean-assets: # PRIVATE
	@rm -rf static/target static/hash static/requirejs

atomise-css: # PRIVATE
	@node tools/atomise-css

# * Not ready for primetime use yet... *
pasteup: # PRIVATE
	@cd static/src/stylesheets/pasteup && npm --silent i && node publish.js



# *********************** CHECKS ***********************

# Run the JS test suite.
test:
	@grunt test --dev

# Lint all assets.
validate:
	@grunt validate

# Lint all SCSS.
validate-sass: # PRIVATE
	@grunt validate:sass
	@grunt validate:css

# Lint all JS.
validate-js: # PRIVATE
	@grunt validate:js

validate-amp: # PRIVATE
	@cd tools/amp-validation && npm install && NODE_ENV=dev node index.js
