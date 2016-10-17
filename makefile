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

# Install all 3rd party dependencies.
install: check-node check-yarn
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

# Make sure we running a recent-enough version of Node.
check-node:
	@./dev/check-node-version.js

# Make sure yarn is installed.
check-yarn: # PRIVATE
	@if [ -z "$$(which yarn)" ]; then npm i -g yarn; fi

# *********************** DEVELOPMENT ***********************

# Watch and automatically compile/reload all JS/SCSS.
# Uses port 3000 insead of 9000.
watch: compile-dev
	@npm run sass-watch & \
		npm run css-watch & \
		npm run browser-sync



# *********************** ASSETS ***********************

# Compile all assets for production.
compile: check-node
	@./tools/assets/compile.js

# Compile all assets for development.
compile-dev: check-node
	@./tools/assets/compile.js --dev

compile-javascript: check-node # PRIVATE
	@./tools/assets/compile.js javascript

compile-javascript-dev: check-node # PRIVATE
	@./tools/assets/compile.js javascript --dev

compile-css: check-node # PRIVATE
	@./tools/assets/compile.js css

compile-images: check-node # PRIVATE
	@./tools/assets/compile.js images

compile-svgs: check-node # PRIVATE
	@./tools/assets/compile.js inline-svgs

compile-fonts: check-node # PRIVATE
	@./tools/assets/compile.js fonts

atomise-css: check-node # PRIVATE
	@node tools/atomise-css

# * Not ready for primetime use yet... *
pasteup: check-node # PRIVATE
	@cd static/src/stylesheets/pasteup && npm --silent i && node publish.js



# *********************** CHECKS ***********************

# Run the JS test suite.
test: check-node
	@grunt test --dev

# Lint all assets.
validate: check-node
	@grunt validate

# Lint all SCSS.
validate-sass: check-node # PRIVATE
	@grunt validate:sass
	@grunt validate:css

# Lint all JS.
validate-javascript: check-node # PRIVATE
	@grunt validate:js

validate-amp: check-node # PRIVATE
	@cd tools/amp-validation && npm install && NODE_ENV=dev node index.js
