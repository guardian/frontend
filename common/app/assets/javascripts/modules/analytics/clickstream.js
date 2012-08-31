define(['common', 'modules/detect', 'vendor/bean-0.4.11-1'], function(common, detect, bean) {

    var Clickstream = function(opts) {
     
        var opts = opts || {},
            filters = opts.filter || [];

        var filterSource = function(element) {
            return filters.filter(function(f) {
                return (f == element)
                })
        }
 
        var getTag = function(element, tag) {

            var elementName = element.tagName.toLowerCase();
            
            if (elementName === 'body')
                return tag.reverse().join(' | ');
            
            if (dataLinkName = element.getAttribute("data-link-name"))
                tag.push(dataLinkName);

            return getTag(element.parentNode, tag)
        }

        // delegate, emit the derived tag
        bean.add(document.body, "click", function(event) {
          
            if (!filterSource(event.target.tagName.toLowerCase()).length > 0)
                return false;
            
            var target = event.target,
                dataIsXhr = target.getAttribute("data-is-ajax"),
                href = target.getAttribute("href");
             
            var isXhr = (dataIsXhr) ? true : false;
            var isInternalAnchor = (href && (href.indexOf('#') === 0)) ? true : false;

            common.mediator.emit('module:clickstream:click', [getTag(target, []), isXhr, isInternalAnchor]) 
        });
     
    }
    
    return (Clickstream);

});

