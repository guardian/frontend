curl(['modules/top-stories']).then(function(TopStories) {

    new TopStories('.top-stories').init();

});
