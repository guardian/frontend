/* global window, document */
'use strict';

/**
* Feature: Section Fronts - Culture
* As a Guardian user
* I want to get a further break-down of sections on the culture section front
* So that I can navigate content easier
**/


casper.start(host + '/culture?view=mobile');

var clearLocalStorage = function() {
    casper.evaluate(function() { window.localStorage.clear(); });
};

var cultureBlockSelector = 'section[data-link-name*="block | Culture"]';

/**
* Scenario: Page contains a culture block
* Given I am on the 'culture' section front
* Then I should see a block called culture
**/

casper.test.begin('Page contains a culture block',function suite(test){

    casper.then(function(){
        test.assertExists(
           'section[data-link-name*="block | Culture"]',
           'Culture should have a section block'
       );
      test.assertSelectorHasText(
      cultureBlockSelector + ' > h1', 'Culture',
      'Culture section block should have a title'
      );
      test.done();
   });
});
  
/**
* Scenario: Culture block contains five trails
* Given I am on the 'culture' section front
* Then I should see a Culture block with five trails
**/

 casper.test.begin('Culture block contains five trails',function (test){
    clearLocalStorage();
    casper.reload();
    var trailCount = casper.evaluate(function(selector) {
        return document.querySelectorAll(selector + ' ul li').length;
    }, cultureBlockSelector);

    test.assertEqual(trailCount, 5, 'Culture block should contain five trails.');
    test.done();
 }); 

/**
* Scenario Outline: Users can view more top stories for the Culture block
* Given I am on the 'culture' section front
* Then the '<section>' section should have a 'Show more' cta that loads in more top stories
**/
casper.test.begin('Culture block has a Show More call to action',function suite(test) {

    clearLocalStorage();
    casper.reload();
    casper.waitForSelector(cultureBlockSelector + ' .cta',function(){
    casper.click(cultureBlockSelector + ' .cta');
    casper.waitFor(function check() {
            return this.evaluate(function(selector) {
                return document.querySelectorAll(selector + ' ul li').length > 5;
            }, cultureBlockSelector)
        });

    });
});


casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('save') || false);
});