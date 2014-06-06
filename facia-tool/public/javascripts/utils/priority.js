define(['config'], function(pageConfig) {
    return function() {
        return (pageConfig.priority === 'editorial' ? undefined : pageConfig.priority);
    };
});
