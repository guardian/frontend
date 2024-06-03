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
	@./dev/watch.js

sbt: # PRIVATE
	./sbt

# *********************** ASSETS ***********************

# Compile all assets in production.
compile: install
	@NODE_ENV=production ./tools/task-runner/runner.mjs compile

# Compile all assets in development.
compile-dev: install
	@NODE_ENV=development ./tools/task-runner/runner.mjs compile --dev

# Compile atom-specific JS
compile-atoms: install
	@./tools/task-runner/runner.mjs compile/javascript/index.atoms

# Compile all assets for watch.
compile-watch: install # PRIVATE
	@NODE_ENV=development ./tools/task-runner/runner.mjs compile/index.watch.mjs

compile-javascript: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/javascript

compile-javascript-dev: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/javascript --dev

compile-css: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/css

compile-images: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/images

compile-svgs: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/inline-svgs

compile-fonts: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/fonts

# *********************** CHECKS ***********************

# Run the JS test suite.
test: install
	@./tools/task-runner/runner.mjs test/javascript --verbose

# Run the modern JS test suite in watch mode.
test-watch: install
	@yarn test -- --watch --coverage

# Check the JS test suite coverage.
coverage: install
	@./tools/task-runner/runner.mjs test/javascript/coverage --stdout

# Validate all assets.
validate: install
	@./tools/task-runner/runner.mjs validate --verbose
	@yarn prettier */test/resources/*.json --check

# Validate all SCSS.
validate-sass: install # PRIVATE
	@./tools/task-runner/runner.mjs validate/sass --verbose

# Validate all JS.
validate-javascript: install # PRIVATE
	@./tools/task-runner/runner.mjs validate/javascript

# Fix JS linting errors.
fix: install
	@./tools/task-runner/runner.mjs validate/javascript-fix
	@yarn prettier */test/resources/*.json --write

# Fix committed JS linting errors.
fix-commits: install
	@./tools/task-runner/runner.mjs validate-head/javascript-fix

# Update caniuse db used by browserslist
# https://github.com/browserslist/update-db
update-caniusedb: install
	@npx --yes update-browserslist-db@latest
