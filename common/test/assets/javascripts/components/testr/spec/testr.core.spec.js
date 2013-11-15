describe('testr', function() {

	it('doesnt execute modules during loading', function() {
		// as they may pollute other modules, or scopes
		expect(window.polluted).toBeUndefined();
	});

	describe('function', function() {

		var module;

		beforeEach(function() {
			module = testr('fn');
		});

		it('returns a module', function() {
			expect(module).toBeDefined();
		});

		it('returns the requested module', function() {
			expect(module.functionDef).toBe(true);
		});

		it('prevents pollution on module', function() {
			module.polluted = true;
			module = testr('fn');
			expect(module.polluted).toBeUndefined();
		});

		it('prevents pollution in module closure', function() {
			module.polluteVal();
			expect(module.getVal()).toBe('polluted');
			module = testr('fn');
			expect(module.getVal()).toBe('unpolluted');
		});

	});

	describe('object', function() {

		var module;

		beforeEach(function() {
			module = testr('obj');
		});

		it('returns the requested module', function() {
			expect(module.objectDef).toBe(true);
		});

		it('prevents pollution', function() {
			module.polluted = true;
			module = testr('obj');
			expect(module.polluted).toBeUndefined();
		});

	});

	describe('function with exports', function() {

		var module;

		it('uses exports object as module', function() {
			module = testr('exports/uses');
			expect(module.useExport).toBe(true);
		});

		it('always uses return value if it exists', function() {
			module = testr('exports/returns');
			expect(module.returnDefine).toBe(true);
			expect(module.exportsDefine).toBeUndefined();
		});

	});

	describe('function with require', function() {

		it('correctly resolves path', function() {
			var module = testr('require/uses');
			expect(module.dep.objectDef).toBe(true);
		});

		it('allows nested requires to be stubbed', function() {
			var module = testr('require/uses', {
				'./../obj': 'stubbed'
			});
			expect(module.dep).toBe('stubbed');
		});

	});

	describe('directory modules', function() {

		it('can be grabbed directly', function() {
			var deepDep = testr('deeper/isdep');
			expect(deepDep.deep).toBe(true);
		});

		it('can be grabbed with the parent syntax', function() {
			var module = testr('../sibling/outsidebase');
			expect(module.outsideBase).toBe(true);
		});

	});

	describe('plugins', function() {

		it('take full control of dependency resolution', function() {
			var module = testr('plugins/uses');
			expect(module.template).toBe('<div>{{content}}</div>');
			module = testr('plugins/uses2');
			expect(module.template).toBe('<div>{{content}}</div>');
		});

		it ('can be stubbed', function() {
			var module = testr('plugins/uses', {
				'text!./template.html': 'stubbed'
			});
			expect(module.template).toBe('stubbed');
		});

		it('can be an object', function() {
			var module = testr('plugins/uses');
			expect(module.asObjDep).toBe('plugin object loaded');
		});

	});

	describe('renamed modules', function() {
		
		it('uses defined name', function() {
			var origModule = testr('rename/def'),
				module = testr('newdefname');

			expect(origModule).toBeFalsy();
			expect(module.redefined).toBe(true);
		});

		it('can be pulled in as real deps', function() {
			var module = testr('rename/use');
			expect(module.dep.redefined).toBe(true);
		});

		it('can be stubbed in the stub object', function() {
			var module = testr('rename/use', {
				'newdefname': 'stubbed'
			});
			expect(module.dep).toBe('stubbed');
		});

		it('can be externally stubbed', function() {
			var module = testr('rename/use', true);
			expect(module.dep.isExternalStub).toBe(true);
		});

	});

	describe('jquery', function() {

		var h1 = document.createElement('h1');
		h1.innerHTML = 'Jasmine Spec Runner';

		beforeEach(function() {
			document.body.appendChild(h1);
		});

		afterEach(function() {
			document.body.removeChild(h1);
		})

		it('can be used', function() {
			var module = testr('usejquery'),
				heading = module.getHeading();
			expect(heading.text()).toContain('Jasmine Spec Runner');
		});

		it('can be stubbed', function() {
			var called = false;
				module = testr('usejquery', {
					'jquery': function() {
						return 'stubbed'
					}
				}),
				heading = module.getHeading();
				
			expect(heading).toBe('stubbed');
		})

	});

	describe('with CJS wrapper', function() {

		it('picks up nested require', function() {
			var module = testr('cjs/wrap');
			expect(module.objDep.cjs).toBe(true);
		});

		it('still allows stubbing', function() {
			var module = testr('cjs/wrap', {
				'cjs/obj': 'stubbed'
			});
			expect(module.objDep).toBe('stubbed');
		});

		it('can pickup relative paths', function() {
			var module = testr('cjs/wrap');
			expect(module.samedir.cjs).toBe(true);
		});

	});

	describe('lazy loading', function() {

		it('pulls in modules asynchronously', function() {
			var module = testr('lazy');
			module.load();
			expect(module.obj).toBeUndefined();

			waitsFor(function() {
				return module.obj;
			}, 'lazy loading module should set property definition', 100);

			runs(function() {
				expect(module.obj.objectDef).toBe(true);
			});
		});

		it('can use the stubs object', function() {
			var module = testr('lazy', {
				'obj': 'stubbed'
			});
			module.load();

			waitsFor(function() {
				return module.obj;
			}, 'lazy loading module should set property definition', 100);

			runs(function() {
				expect(module.obj).toBe('stubbed');
			});
		})

	});

	describe('with shimmed modules', function() {

		it('uses object from requirejs', function() {
			var module = testr('shimmed/uses');
			expect(module.o.isShimmed).toBe(true);
			module = testr('shimmed/uses2');
			expect(module.o.isShimmed).toBe(true);
			module = testr('shimmed/uses3');
			expect(module.o.isShimmed).toBe(true);
		});

	});

});