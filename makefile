# Targets marked '# PRIVATE' will be hidden when running `make help`.
# They're helper targets that you probably only need to know about
# if you've got as far as reading the makefile.

# Add phony targets
.PHONY: sbt


# *********************** SETUP ***********************

# Install all 3rd party dependencies.
install: check-node-env
	@yarn install
	@./tools/sync-githooks.js

# Remove all 3rd party dependencies.
uninstall: # PRIVATE
	@rm -rf node_modules
	@echo 'All 3rd party dependencies have been uninstalled.'

# Reinstall all 3rd party dependencies from scratch.
# The nuclear option if `make install` hasn't worked.
reinstall: uninstall install

# Make sure the local node env is up to scratch.
check-node-env: # PRIVATE
	@./tools/check-node-env.js

# *********************** DEVELOPMENT ***********************

# Watch and automatically compile/reload all JS/SCSS.
# Uses port 3000 insead of 9000.
watch: compile-watch
	@node ./dev/watch.mjs

sbt: # PRIVATE
	./sbt

# *********************** ASSETS ***********************

# Compile all assets in production.
compile: install
	@NODE_ENV=production node ./tools/task-runner/runner.mjs compile/index.mjs

# Compile all assets in development.
compile-dev: install
	@NODE_ENV=development node ./tools/task-runner/runner.mjs compile/index.mjs --dev

# Compile atom-specific JS
compile-atoms: install
	@node ./tools/task-runner/runner.mjs compile/javascript/index.atoms.js

# Compile all assets for watch.
compile-watch: install # PRIVATE
	@NODE_ENV=development node ./tools/task-runner/runner.mjs compile/index.watch.mjs

compile-javascript: install # PRIVATE
	@node ./tools/task-runner/runner.mjs compile/javascript/index.mjs

compile-javascript-dev: install # PRIVATE
	@node ./tools/task-runner/runner.mjs compile/javascript/index.mjs --dev

compile-css: install # PRIVATE
	@node ./tools/task-runner/runner.mjs compile/css/index.mjs

compile-images: install # PRIVATE
	@node ./tools/task-runner/runner.mjs compile/images/index.mjs

compile-svgs: install # PRIVATE
	@node ./tools/task-runner/runner.mjs compile/inline-svgs/index.mjs

# *********************** CHECKS ***********************

# Run the JS test suite.
test: install
	@node ./tools/task-runner/runner.mjs test/javascript --verbose

# Run the modern JS test suite in watch mode.
test-watch: install
	@yarn test -- --watch --coverage

# Check the JS test suite coverage.
coverage: install
	@node ./tools/task-runner/runner.mjs test/javascript/coverage --stdout

# Validate all assets.
validate: install
	@node ./tools/task-runner/runner.mjs validate/index.mjs --verbose
	@yarn prettier */test/resources/*.json --check

# Validate all SCSS.
validate-sass: install # PRIVATE
	@node ./tools/task-runner/runner.mjs validate/sass --verbose

# Validate all JS.
validate-javascript: install # PRIVATE
	@node ./tools/task-runner/runner.mjs validate/javascript

# Fix JS linting errors.
fix: install
	@node ./tools/task-runner/runner.mjs validate/javascript-fix.mjs
	@yarn prettier */test/resources/*.json --write

# Fix committed JS linting errors.
fix-commits: install
	@node ./tools/task-runner/runner.mjs validate-head/javascript-fix.mjs

# Update caniuse db used by browserslist
# https://github.com/browserslist/update-db
update-caniusedb: install
	@npx --yes update-browserslist-db@latest
