describe("knockout-sortable", function(){
    //helper engine that can use a template from a string
    ko.stringTemplateEngine = function() {
        var templates = { data: {} };

        var stringTemplateSource = function(template) {
            this.text = function(value) {
                if (arguments.length === 0) {
                    return templates[template];
                }
                templates[template] = value;
            };
        };

        var templateEngine = new ko.nativeTemplateEngine();
        templateEngine.makeTemplateSource = function(template) {
            return new stringTemplateSource(template);
        };

        templateEngine.addTemplate = function(key, value) {
            templates[key] = value;
        };

        return templateEngine;
    };

    var defaults = {
        connectClass: ko.bindingHandlers.sortable.connectClass,
        allowDrop: ko.bindingHandlers.sortable.allowDrop,
        beforeMove: ko.bindingHandlers.sortable.beforeMove,
        afterMove: ko.bindingHandlers.sortable.afterMove,
        afterRender: ko.bindingHandlers.sortable.afterRender
    };

    var setup = function(options) {
        ko.setTemplateEngine(options.engine || new ko.nativeTemplateEngine());
        options.root = options.elems.first();
        $("body").append(options.root);
        options.root.hide();
        ko.applyBindings(options.vm, options.root[0]);
    };

    describe("sortable binding", function() {
        beforeEach(function() {
            //restore defaults
            ko.utils.extend(ko.bindingHandlers.sortable, defaults);
        });

        describe("when using an anonymous template", function(){
            it("should render all items", function(){
                var children,
                    options = {
                        elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                        vm: { items: ko.observableArray([1, 2, 3]) }
                    };

                setup(options);

                children = options.root.children();

                expect(children.length).toEqual(3);
                expect(children.eq(0).text()).toEqual("1");
                expect(children.eq(1).text()).toEqual("2");
                expect(children.eq(2).text()).toEqual("3");
            });

            describe("when using 'as' to name the context", function() {
                it("should allow referring to child items by 'as' name", function() {
                    var children,
                        options = {
                            elems: $("<ul data-bind='sortable: { data: items, as: \"myitem\" }'><li data-bind=\"text: myitem\"></li></ul>"),
                            vm: { items: ko.observableArray([1, 2, 3]) }
                        };

                    setup(options);

                    children = options.root.children();

                    expect(children.length).toEqual(3);
                    expect(children.eq(0).text()).toEqual("1");
                    expect(children.eq(1).text()).toEqual("2");
                    expect(children.eq(2).text()).toEqual("3");
                });
            });
        });

        describe("when using a named template", function() {
            it("should render all items", function(){
                var children,
                    options = {
                        elems: $("<ul data-bind='sortable: { template: \"itemTmpl\", data: items }'></ul>"),
                        vm: { items: ko.observableArray([1, 2, 3]) },
                        engine: ko.stringTemplateEngine()
                    };

                options.engine.addTemplate("itemTmpl", "<li data-bind='text: $data'></li>");
                setup(options);

                children = options.root.children();

                expect(children.length).toEqual(3);
                expect(children.eq(0).text()).toEqual("1");
                expect(children.eq(1).text()).toEqual("2");
                expect(children.eq(2).text()).toEqual("3");
            });

            describe("when using 'as' to name the context", function() {
                it("should allow referring to child items by 'as' name", function() {
                    var children,
                        options = {
                            elems: $("<ul data-bind='sortable: { template: \"itemTmpl\", data: items, as: \"myitem\" }'></ul>"),
                            vm: { items: ko.observableArray([1, 2, 3]) },
                            engine: ko.stringTemplateEngine()
                        };

                    options.engine.addTemplate("itemTmpl", "<li data-bind='text: myitem'></li>");

                    setup(options);

                    children = options.root.children();

                    expect(children.length).toEqual(3);
                    expect(children.eq(0).text()).toEqual("1");
                    expect(children.eq(1).text()).toEqual("2");
                    expect(children.eq(2).text()).toEqual("3");
                })
            });
        });

        describe("when using the default options", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                setup(options);
            });

            it("should add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });

            it("should call .sortable on the root element", function() {
                waits(0);
                runs(function() {
                    expect(options.root.data("sortable")).toBeDefined();
                });
                
            });

            it("should attach meta-data to the root element indicating the parent observableArray", function() {
                expect(ko.utils.domData.get(options.root[0], "ko_sortList")).toEqual(options.vm.items);
            });

            it("should attach meta-data to child elements indicating their item", function() {
                expect(ko.utils.domData.get(options.root.children()[0], "ko_sortItem")).toEqual(options.vm.items()[0]);
            });

            it("should attach meta-data to child elements indicating their parent observableArray", function() {
                expect(ko.utils.domData.get(options.root.children()[0], "ko_parentList")).toEqual(options.vm.items);
            });
        });

        describe("when setting afterRender globally", function() {
            describe("when passing just data", function() {
                var afterRenderSpy;
                beforeEach(function() {
                    options = {
                        elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                        vm: { items: ko.observableArray([1, 2, 3]) }
                    };

                    afterRenderSpy = jasmine.createSpy("afterRender spy");
                    ko.bindingHandlers.sortable.afterRender = afterRenderSpy;
                    setup(options);
                });

                it("should call the global afterRender on each item", function() {
                    expect(afterRenderSpy.callCount).toEqual(3);
                });

                it("should attach meta-data to child elements indicating their item", function() {
                    expect(ko.utils.domData.get(options.root.children()[0], "ko_sortItem")).toEqual(options.vm.items()[0]);
                });

                it("should attach meta-data to child elements indicating their parent observableArray", function() {
                    expect(ko.utils.domData.get(options.root.children()[0], "ko_parentList")).toEqual(options.vm.items);
                });
            });

            describe("when passing options", function() {
                var afterRenderSpy;
                beforeEach(function() {
                    options = {
                        elems: $("<ul data-bind='sortable: { data: items }'><li data-bind='text: $data'></li></ul>"),
                        vm: { items: ko.observableArray([1, 2, 3]) }
                    };

                    afterRenderSpy = jasmine.createSpy("afterRender spy");
                    ko.bindingHandlers.sortable.afterRender = afterRenderSpy;
                    setup(options);
                });

                it("should call the global afterRender on each item", function() {
                    expect(afterRenderSpy.callCount).toEqual(3);
                });

                it("should attach meta-data to child elements indicating their item", function() {
                    expect(ko.utils.domData.get(options.root.children()[0], "ko_sortItem")).toEqual(options.vm.items()[0]);
                });

                it("should attach meta-data to child elements indicating their parent observableArray", function() {
                    expect(ko.utils.domData.get(options.root.children()[0], "ko_parentList")).toEqual(options.vm.items);
                });
            });
        });

        describe("when passing afterRender in options", function() {
            var afterRenderSpy;
            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, afterRender: afterRenderSpy }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]), afterRenderSpy: jasmine.createSpy("afterRender spy") }
                };

                //local afterRender will override this one
                ko.bindingHandlers.sortable.afterRender = function() {};
                setup(options);
            });

            it("should call the local afterRender on each item rather than the global one", function() {
                expect(options.vm.afterRenderSpy.callCount).toEqual(3);
            });

            it("should attach meta-data to child elements indicating their item", function() {
                expect(ko.utils.domData.get(options.root.children()[0], "ko_sortItem")).toEqual(options.vm.items()[0]);
            });

            it("should attach meta-data to child elements indicating their parent observableArray", function() {
                expect(ko.utils.domData.get(options.root.children()[0], "ko_parentList")).toEqual(options.vm.items);
            });
        });

        describe("when setting allowDrop globally to false", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                ko.bindingHandlers.sortable.allowDrop = false;
                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });
        });

        describe("when setting allowDrop globally to an observable that is false", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                ko.bindingHandlers.sortable.allowDrop = ko.observable(false);
                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should add the default connectWith class after setting the observable to true", function() {
                ko.bindingHandlers.sortable.allowDrop(true);
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });
        });

        describe("when setting allowDrop globally to a function", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]), disabled: function(list) { return list().length > 3; } }
                };

                ko.bindingHandlers.sortable.allowDrop = options.vm.disabled;
                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should add the default connectWith class after setting the observable to true", function() {
                options.vm.items.push(4);
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });
        });

        describe("when passing false for allowDrop in the binding options", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, allowDrop: false }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });
        });

        describe("when passing an observable that is false for allowDrop in the binding options", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, allowDrop: enabled }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]), enabled: ko.observable(false) }
                };

                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should add the default connectWith class after setting the observable to true", function() {
                options.vm.enabled(true);
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });
        });

        describe("when passing a function for allowDrop in the binding options", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, allowDrop: disabled }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]), disabled: function(list) { return list().length > 3; } }
                };

                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should re-evaluate the allowDrop function when any observables change and add the connectWith class, if appropriate", function() {
                options.vm.items.push(4);
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });
        });

        describe("when overriding the connectWith class globally", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };
            });
            
            describe("when using an override class", function() {
                beforeEach(function() {
                    ko.bindingHandlers.sortable.connectClass = "mycontainer";
                    setup(options);
                });

                it("should not add the default connectWith class 'ko_container' to the root element", function(){
                    expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
                });

                it("should add the overriden connectWith class 'mycontainer' to the root element", function(){
                    expect(options.root.hasClass('mycontainer')).toBeTruthy();
                });
            });
            
            describe("when setting the connectWith class to null", function() {
                beforeEach(function() {
                    ko.bindingHandlers.sortable.connectClass = null;
                    setup(options);
                });
                
                it("should not add a connectWith class to the root element", function() {
                    expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
                });
                
                it("should set this element's sortable connectWith option to false", function() {
                    waits(0);
                    runs(function() {
                        expect(options.root.sortable("option", "connectWith")).toEqual(false);
                    }); 
                });
            });
            
            describe("when setting the connectWith class to false", function() {
                beforeEach(function() {
                    ko.bindingHandlers.sortable.connectClass = false;
                    setup(options);
                });
                
                it("should not add a connectWith class to the root element", function() {
                    expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
                });
                
                it("should set this element's sortable connectWith option to false", function() {
                    waits(0);
                    runs(function() {
                        expect(options.root.sortable("option", "connectWith")).toEqual(false);
                    });
                });
            });
        });

        describe("when overriding connectClass in the binding options", function() {
            var options;
            
            describe("when using an override class", function() {
                beforeEach(function() {
                    options = {
                        elems: $("<ul data-bind='sortable: { data: items, connectClass: \"mycontainer\" }'><li data-bind='text: $data'></li></ul>"),
                        vm: { items: ko.observableArray([1, 2, 3]) }
                    };

                    setup(options);
                });
                
                it("should not add the default connectWith class 'ko_container' to the root element", function(){
                    expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
                });

                it("should add the overriden connectWith class 'mycontainer' to the root element", function(){
                    expect(options.root.hasClass('mycontainer')).toBeTruthy();
                });
            });
            
            describe("when setting the connectWith class to null", function() {
                beforeEach(function() {
                    options = {
                        elems: $("<ul data-bind='sortable: { data: items, connectClass: null }'><li data-bind='text: $data'></li></ul>"),
                        vm: { items: ko.observableArray([1, 2, 3]) }
                    };

                    setup(options);
                });
                
                it("should not add a connectWith class to the root element", function() {
                    expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
                });
                
                it("should set this element's sortable connectWith option to false", function() {
                    waits(0);
                    runs(function() {
                        expect(options.root.sortable("option", "connectWith")).toEqual(false);
                    });
                });
            });
            
            describe("when setting the connectWith class to false", function() {
                beforeEach(function() {
                    options = {
                        elems: $("<ul data-bind='sortable: { data: items, connectClass: false }'><li data-bind='text: $data'></li></ul>"),
                        vm: { items: ko.observableArray([1, 2, 3]) }
                    };

                    setup(options);
                });
                
                it("should not add a connectWith class to the root element", function() {
                    expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
                });
                
                it("should set this element's sortable connectWith option to false", function() {
                    waits(0);
                    runs(function() {
                        expect(options.root.sortable("option", "connectWith")).toEqual(false);
                    });
                });
            });
        });

        describe("when setting isEnabled globally", function() {
            var options;
            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: {
                        items: ko.observableArray([1, 2, 3]),
                        isEnabled: ko.observable(false)
                    }
                };
            });

            describe("when isEnabled is an observable", function() {
                beforeEach(function() {
                    ko.bindingHandlers.sortable.isEnabled = options.vm.isEnabled;
                    setup(options);
                });

                it("should be initially disabled", function() {
                    waits(0);
                    runs(function() {
                        expect(options.root.sortable("option", "disabled")).toBeTruthy();
                    });
                });

                it("should become enabled when observable is changed to true", function() {
                    waits(0);
                    runs(function() {
                        options.vm.isEnabled(true);
                        expect(options.root.sortable("option", "disabled")).toBeFalsy();
                    });
                })
            });

            describe("when isEnabled is a non-observable", function() {
                beforeEach(function() {
                    ko.bindingHandlers.sortable.isEnabled = false;
                    setup(options);
                });

                it("should be initially disabled", function() {
                    waits(0);
                    runs(function() {
                        expect(options.root.sortable("option", "disabled")).toBeTruthy();
                    });
                });
            });
        });

        describe("when setting isEnabled in the binding", function() {
            var options;
            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, isEnabled: isEnabled }'><li data-bind='text: $data'></li></ul>"),
                    vm: {
                        items: ko.observableArray([1, 2, 3]),
                        isEnabled: ko.observable(false)
                    }
                };
            });

            describe("when isEnabled is an observable", function() {
                beforeEach(function() {
                    setup(options);
                });

                it("should be initially disabled", function() {
                    waits(0);
                    runs(function() {
                        expect(options.root.sortable("option", "disabled")).toBeTruthy();
                    });
                });

                it("should become enabled when observable is changed to true", function() {
                    waits(0);
                    runs(function() {
                        options.vm.isEnabled(true);
                        expect(options.root.sortable("option", "disabled")).toBeFalsy();                    
                    });
                })
            });

            describe("when isEnabled is a non-observable", function() {
                beforeEach(function() {
                    options.vm.isEnabled = false;
                    setup(options);
                });

                it("should be initially disabled", function() {
                    waits(0);
                    runs(function() {
                        expect(options.root.sortable("option", "disabled")).toBeTruthy();
                    });
                });
            });
        });

        describe("when passing extra options for .sortable in the binding", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, options: { axis: \"x\" } }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                setup(options);
            });

            it("should pass the option on to .sortable properly", function() {
                waits(0);
                runs(function() {
                    expect(options.root.sortable("option", "axis")).toEqual('x');
                });
            });
        });

        describe("when setting extra options for .sortable globally", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                ko.bindingHandlers.sortable.options = { axis: 'x' };

                setup(options);
            });

            it("should pass the option on to .sortable properly", function() {
                waits(0);
                runs(function() {
                    expect(options.root.sortable("option", "axis")).toEqual('x');
                });
            });
        });

        describe("when setting extra options for sortable globally and locally", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, options: { cursor: \"crosshair\", axis: \"y\" } }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                ko.bindingHandlers.sortable.options = { axis: 'x', delay: 100 };

                setup(options);
            });

            it("should pass the local option rather than the global option to .sortable properly", function() {
                waits(0);
                runs(function() {
                    expect(options.root.sortable("option", "axis")).toEqual('y');
                });
            });

            it("should pass the local option on to .sortable properly", function() {
                waits(0);
                runs(function() {
                    expect(options.root.sortable("option", "cursor")).toEqual('crosshair');
                });
            });

            it("should pass the global option on to .sortable properly", function() {
                waits(0);
                runs(function() {
                    expect(options.root.sortable("option", "delay")).toEqual(100);
                });
            });
        });
        
        describe("when using a computed observable to return an observableArray", function() {
            var options;
            
            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: activeList()'><li data-bind='text: $data'></li></ul>"),
                    vm: { 
                        itemsOne: ko.observableArray([1, 2, 3]),
                        itemsTwo: ko.observableArray(["a", "b", "c"]),
                        useTwo: ko.observable(false)
                    }
                };
                
                options.vm.activeList = ko.computed(function() {
                    return this.useTwo() ? this.itemsTwo : this.itemsOne;
                }, options.vm);

                setup(options);
            });
            
            it("should render the initial list", function() {
                expect(options.root.children().first().text()).toEqual("1");
                expect(options.root.children(":nth-child(2)").text()).toEqual("2");
                expect(options.root.children(":nth-child(3)").text()).toEqual("3");
            });
            
            describe("when updating the list that is returned by the computed observable", function() {
                it("should render the new list", function() {
                    options.vm.useTwo(true);
                    expect(options.root.children().first().text()).toEqual("a");
                    expect(options.root.children(":nth-child(2)").text()).toEqual("b");
                    expect(options.root.children(":nth-child(3)").text()).toEqual("c");
                });
            });
        });

        describe("when removing the element before initialization", function() {
           it("should not cause an error in disposal", function() {
               options = {
                   elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                   vm: {
                       items: ko.observableArray([1, 2, 3])
                   }
               };

               setup(options);

               //remove node prior to the setTimeout to initialize the sortable runs
               ko.removeNode(options.elems.first()[0]);
           });
        });
    });

    describe("draggable binding", function() {
        var options,
            defaults = {
            connectClass: ko.bindingHandlers.draggable.connectClass,
            isEnabled: ko.bindingHandlers.draggable.isEnabled
        };

        beforeEach(function() {
            ko.utils.extend(ko.bindingHandlers.draggable.options, defaults);
        });

        describe("when using an anonymous template", function() {
            beforeEach(function() {
                options = {
                    elems: $("<div data-bind='draggable: item'><span data-bind='text: first'></span></div>"),
                    vm: { item: { first: ko.observable("Bob") } }
                };

                setup(options);
            });

            it("should render the content with the right context", function() {
                expect(options.root.first().text()).toEqual("Bob");
            });
        });

        describe("when using a named template", function() {
            beforeEach(function() {
                options = {
                    elems: $("<div data-bind='draggable: { template: \"dragTmpl\", data: item }'></ul>"),
                    vm: { item: { first: ko.observable("Bob") } },
                    engine: ko.stringTemplateEngine()
                };

                options.engine.addTemplate("dragTmpl", "<span data-bind='text: first'></span>");
                setup(options);
            });

            it("should render the template content properly", function(){
                expect(options.root.first().text()).toEqual("Bob");
            });
        });

        describe("when using the default options", function() {
            beforeEach(function() {
                options = {
                    elems: $("<div data-bind='draggable: item'><span data-bind='text: first'></span></div>"),
                    vm: { item: { first: ko.observable("Bob") } }
                };

                setup(options);
            });

            it("should add the draggable classes", function() {
                expect(options.root.hasClass("ui-draggable")).toBeTruthy();
            });

            it("should call draggable on the element", function() {
                expect(options.root.data("draggable")).toBeDefined();
            });

            it("should use the default connectClass", function() {
                expect(options.root.draggable("option", "connectToSortable")).toEqual("." + defaults.connectClass);
            });
        });

        describe("when overriding connectClass", function() {
           describe("when overriding globally", function() {
               beforeEach(function() {
                   options = {
                       elems: $("<div data-bind='draggable: item'><span data-bind='text: first'></span></div>"),
                       vm: { item: { first: ko.observable("Bob") } }
                   };

                   ko.bindingHandlers.draggable.connectClass = "globalTest";

                   setup(options);
               });

               it("should use the default connectClass", function() {
                   expect(options.root.draggable("option", "connectToSortable")).toEqual("." + ko.bindingHandlers.draggable.connectClass);
               });
           });

           describe("when overriding locally", function() {
               beforeEach(function() {
                   options = {
                       elems: $("<div data-bind='draggable: { data: item, connectClass: connectClass }'><span data-bind='text: first'></span></div>"),
                       vm: { item: { first: ko.observable("Bob") }, connectClass: "localTest" }
                   };

                   setup(options);
               });

               it("should use the default connectClass", function() {
                   expect(options.root.draggable("option", "connectToSortable")).toEqual("." + options.vm.connectClass);
               });
           });
        });

        describe("when setting isEnabled", function() {
            var options;

            describe("when specifying in binding", function() {
                describe("when using a non-observable", function() {
                    beforeEach(function() {
                        options = {
                            elems: $("<div data-bind='draggable: { data: item, isEnabled: false }'><span data-bind='text: first'></span></div>"),
                            vm: { item: { first: ko.observable("Bob") } }
                        };

                        setup(options);
                    });

                    it("should be marked as disabled", function() {
                        expect(options.root.hasClass("ui-draggable-disabled")).toBeTruthy();
                    });
                });

                describe("when using an observable", function() {
                    beforeEach(function() {
                        options = {
                            elems: $("<div data-bind='draggable: { data: item, isEnabled: isEnabled }'><span data-bind='text: first'></span></div>"),
                            vm: { item: { first: ko.observable("Bob") }, isEnabled: ko.observable(false) }
                        };

                        setup(options);
                    });

                    it("should be marked as disabled", function() {
                        expect(options.root.hasClass("ui-draggable-disabled")).toBeTruthy();
                    });

                    describe("when updating the observable to true", function() {
                        beforeEach(function() {
                            options.vm.isEnabled(true);
                        });

                        it("should be marked as enabled", function() {
                            expect(options.root.hasClass("ui-draggable-disabled")).toBeFalsy();
                        });
                    });
                });
            });

            describe("when specifying globally", function() {
                describe("when using a non-observable", function() {
                    beforeEach(function() {
                        options = {
                            elems: $("<div data-bind='draggable: item'><span data-bind='text: first'></span></div>"),
                            vm: { item: { first: ko.observable("Bob") } }
                        };

                        ko.bindingHandlers.draggable.isEnabled = false;

                        setup(options);
                    });

                    it("should be marked as disabled", function() {
                        expect(options.root.hasClass("ui-draggable-disabled")).toBeTruthy();
                    });
                });

                describe("when using an observable", function() {
                    beforeEach(function() {
                        options = {
                            elems: $("<div data-bind='draggable: item'><span data-bind='text: first'></span></div>"),
                            vm: { item: { first: ko.observable("Bob") } }
                        };

                        ko.bindingHandlers.draggable.isEnabled = ko.observable(false);

                        setup(options);
                    });

                    it("should be marked as disabled", function() {
                        expect(options.root.hasClass("ui-draggable-disabled")).toBeTruthy();
                    });

                    describe("when updating the observable to true", function() {
                        beforeEach(function() {
                            ko.bindingHandlers.draggable.isEnabled(true);
                        });

                        it("should be marked as enabled", function() {
                            expect(options.root.hasClass("ui-draggable-disabled")).toBeFalsy();
                        });
                    });
                });
            });
        });

        describe("when passing extra options", function() {
            var options;

            describe("when specifying in binding", function() {
                beforeEach(function() {
                    options = {
                        elems: $("<div data-bind='draggable: { data: item, options: { delay: 150 } }'><span data-bind='text: first'></span></div>"),
                        vm: { item: { first: ko.observable("Bob") } }
                    };

                    setup(options);
                });

                it("should use the option", function() {
                    expect(options.root.draggable("option", "delay")).toEqual(150);
                });
            });

            describe("when specifying globally", function() {
                beforeEach(function() {
                    options = {
                        elems: $("<div data-bind='draggable: item'><span data-bind='text: first'></span></div>"),
                        vm: { item: { first: ko.observable("Bob") } }
                    };

                    ko.bindingHandlers.draggable.options.delay = 175;

                    setup(options);
                });

                it("should use the option", function() {
                    expect(options.root.draggable("option", "delay")).toEqual(175);
                });
            });

            describe("when specifying globally and overriding in binding", function() {
                beforeEach(function() {
                    options = {
                        elems: $("<div data-bind='draggable: { data: item, options: { delay: 150 } }'><span data-bind='text: first'></span></div>"),
                        vm: { item: { first: ko.observable("Bob") } }
                    };

                    setup(options);
                });

                ko.bindingHandlers.draggable.options.delay = 175;

                it("should use the option specified in the binding", function() {
                    expect(options.root.draggable("option", "delay")).toEqual(150);
                });
            });
        });
    });
});