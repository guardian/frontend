define(['common', 'modules/detect', 'vendor/bean-0.4.11-1'], function(common, detect, bean) {

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
        common.mediator.emit('clickstream:click', getTag(event.target, [])) 
    });

    return function() {}

});

