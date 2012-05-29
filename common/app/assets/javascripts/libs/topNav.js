require(["bean", "bonzo"], function(bean, bonzo){
    // toggle the nav submenu state
    var sectionExpander = document.getElementById('js-show-sections');
    var submenu = document.getElementById('js-section-subnav');
    if (sectionExpander && submenu) {
        bean.add(sectionExpander, 'click', function(){
            bonzo(submenu).toggleClass('initially-off');
        });
    }
})
