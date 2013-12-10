define(['text!./template.html', 'pluginobj!'], function(text, asObjDep) {
	return {
		template: text,
		asObjDep: asObjDep
	};
});