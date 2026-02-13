# Targets marked '# PRIVATE' will be hidden when running `make help`.
# They're helper targets that you probably only need to know about
# if you've got as far as reading the makefile.

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
	@./dev/watch.mjs


# *********************** ASSETS ***********************

# Compile all assets in production.
compile: install
	@NODE_ENV=production ./tools/task-runner/runner.mjs compile/index.mjs

# Compile all assets in development.
compile-dev: install
	@NODE_ENV=development ./tools/task-runner/runner.mjs compile/index.dev.mjs

# Compile atom-specific JS
compile-atoms: install
	@./tools/task-runner/runner.mjs compile/javascript/index.atoms.mjs

# Compile all assets for watch.
compile-watch: install # PRIVATE
	@NODE_ENV=development ./tools/task-runner/runner.mjs compile/index.watch.mjs

compile-javascript: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/javascript/index.mjs

compile-javascript-dev: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/javascript/index.dev.mjs

compile-css: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/css/index.mjs

compile-images: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/images/index.mjs

compile-svgs: install # PRIVATE
	@./tools/task-runner/runner.mjs compile/inline-svgs/index.mjs

# *********************** CHECKS ***********************

# Run the JS test suite.
test: install
	@./tools/task-runner/runner.mjs test/javascript/index.mjs --verbose

# Run the modern JS test suite in watch mode.
test-watch: install
	@yarn test -- --watch --coverage

# Validate all assets.
validate: install
	@./tools/task-runner/runner.mjs validate/index.mjs --verbose
	@yarn prettier dev --check
	@yarn prettier */test/resources/*.json --check

# Validate all SCSS.
validate-sass: install # PRIVATE
	@./tools/task-runner/runner.mjs validate/sass.mjs --verbose

# Validate all JS.
validate-javascript: install # PRIVATE
	@./tools/task-runner/runner.mjs validate/javascript.mjs

# Fix JS linting errors.
fix: install
	@./tools/task-runner/runner.mjs validate/javascript-fix.mjs
	@yarn prettier dev --write
	@yarn prettier */test/resources/*.json --write

# Fix committed JS linting errors.
fix-commits: install
	@./tools/task-runner/runner.mjs validate-head/javascript-fix.mjs

# Update caniuse db used by browserslist
# https://github.com/browserslist/update-db
update-caniusedb: install
	@npx --yes update-browserslist-db@latest
