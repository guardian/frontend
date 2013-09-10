/*
Top Stories test
*/

casper.start(host + 'world/2013/jun/06/obama-administration-nsa-verizon-records?view=mobile');

/**
* Scenario: Navigation buttons
* Given I am on an article page
* When I choose to click top stories button
* Then I can see 10 top stories
**/

casper.test.begin('Load top stories', function(test) {

   casper.waitForSelector('.nav-popup-topstories.lazyloaded',function(){
        test.assertEvalEquals(function() {
            return document.querySelectorAll('.nav-popup-topstories li').length;
        }, 10, 'Then I can see 10 top stories');
        test.done();
    }, function timeout(){
        test.fail('Top stories failed to load');
    });

});

casper.test.begin('Top stories title is inserted', function(test) {
   casper.waitForSelector('.nav-popup-topstories.lazyloaded',function(){
        test.assertEvalEquals(function() {
            return document.querySelector('.nav-popup-topstories :first-child').textContent;
        }, 'Top stories', 'Then the top stories title is inserted');
    test.done();
    }, function timeout(){
        test.fail('Top stories title is not in');
    });

});


casper.test.begin('Top stories is not visible before I click it',function(test) {

    casper.waitForSelector('.nav-popup-topstories.lazyloaded',function(){
        test.assertNotVisible('.nav-popup-topstories', 'The top stories are not visible at page load');
        test.done();
    });


     casper.test.begin('Top stories control can be toggled on and off',function(test){
        casper.click('[data-toggle="nav-popup-topstories"]');
        test.assertVisible('.nav-popup-topstories', 'The top stories are visible after clicking top stories button');
         test.assertEvalEquals(function() {
            return document.querySelectorAll('[data-link-name="top-stories"] > ul >li').length;
        }, 10, 'Then I can see 10 headlines');
        casper.waitForSelector('.nav-popup-topstories.lazyloaded',function(){
        casper.click('[data-toggle="nav-popup-topstories"]');
        test.assertNotVisible('.nav-popup-topstories', 'The top stories are hidden after clicking top stories button');
        test.done();

        
       });

    });      
});





casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'navigation-top-stories.xml');
});