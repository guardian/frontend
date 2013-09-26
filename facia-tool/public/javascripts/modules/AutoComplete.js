define(["Common"], function (Common) {

    var items = 10
      , autocomplete
      , hide = function () {
            autocomplete.hide().empty();
            }
      , container = '<ul class="dropdown-menu">%s</ul>'
      , item = '<li><a href="#" data-id="%s">%s</a></li>'
      , render = function(search, inputElement) {

             var results = search.results.splice(0, items).map(function (result) {
                 return item.replace(/\%s/gi, result.id);
             })

             if (results.length > 0) {
                autocomplete.insertAfter(inputElement).show(); // move under the correct input
             } else {
                autocomplete.hide();
             }

             var html = container.replace("%s", results.join(''), "gm");
             autocomplete.html(html);
        }
      , selected = function (e) {
                var id = e.target.getAttribute('data-id');
                Common.mediator.emitEvent('modules:autocomplete:selected', [id, autocomplete.prev()]);
                e.preventDefault();
            }
      , init = function () {

            autocomplete = $('#autocomplete');

            hide();
            autocomplete.click(selected);
            
            Common.mediator.addListener('ui:autocomplete:keydown', hide);
            Common.mediator.addListener('modules:autocomplete:selected', hide);
            Common.mediator.addListener('modules:tagsearch:success', render);
        };

    return {
        selected: selected,
        render: render,
        init: init
    }

});

