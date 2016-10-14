# Targets marked '# PRIVATE' will be hidden when running `make help`.
# They're helper targets that you probably only need to know about
# if you've got as far as reading the makefile.

# Lists common tasks.
# Also the default task (`make` === `make help`).
help:
	@node tools/messages.js describeMakefile

# Lists *all* targets.
list: # PRIVATE
	@node tools/messages.js describeMakefile --all



# *********************** SETUP ***********************

# make sure we have yarn available to run
check-yarn: # PRIVATE
	@if [ -z "$$(which yarn)" ]; then npm i -g yarn; fi

# Install all 3rd party dependencies.
install: check-yarn
	@echo 'Installing 3rd party dependencies…'
	@yarn install
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
compile:
	@./tools/assets/compile.js

# Compile all assets for development.
compile-dev:
	@./tools/assets/compile.js --dev

compile-javascript: # PRIVATE
	@./tools/assets/compile.js javascript

compile-javascript-dev: # PRIVATE
	@./tools/assets/compile.js javascript --dev

compile-css: # PRIVATE
	@./tools/assets/compile.js css

compile-images: # PRIVATE
	@./tools/assets/compile.js images

compile-svgs: # PRIVATE
	@./tools/assets/compile.js inline-svgs

compile-fonts: # PRIVATE
	@./tools/assets/compile.js fonts

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
validate-javascript: # PRIVATE
	@grunt validate:js

validate-amp: # PRIVATE
	@cd tools/amp-validation && npm install && NODE_ENV=dev node index.js
