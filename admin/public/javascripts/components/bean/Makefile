build: boosh component_json

boosh:
	node make/build.js

component_json:
	@echo '{' > component.json
	@egrep '(name|description|version|keywords)' package.json >> component.json
	@echo '  , "main":     "bean.js"' >> component.json
	@echo '  , "scripts": ["bean.js"]' >> component.json
	@echo '  , "repo": "https://github.com/fat/bean"' >> component.json
	@echo '}' >> component.json

components: component_json
	component build
