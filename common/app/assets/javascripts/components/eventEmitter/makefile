default: validate compress
develop: validate

validate:
	@@echo 'Validating'
	@@node build/validate.js src/EventEmitter.js

compress:
	@@echo 'Compressing'
	@@java -jar build/compiler.jar --js src/EventEmitter.js --js_output_file src/EventEmitter.min.js
