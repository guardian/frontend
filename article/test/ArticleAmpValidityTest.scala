package test

import org.scalatest.DoNotDiscover


@DoNotDiscover class ArticleAmpValidityTest extends AmpValidityTest {

  /*
      NB: these may be duplicated in tools/amp-validation - if you add or remove
      a URL from here, think about whether it should be changed there too. Not
      centralising as running full suite here may be overkill as we add more tests
   */
  Seq(
    "/commentisfree/2016/aug/09/jeremy-corbyn-supporters-voters-labour-leader-politics", // Comment tone
    "/books/2011/aug/24/jorge-luis-borges-google-doodle", // More on this story
    "/uk-news/2016/aug/09/southern-rail-strike-war-of-words-heats-up-on-second-day", // Story package / tone news
    "/football/2016/jul/10/france-portugal-euro-2016-match-report", // Match summary
    "/us-news/live/2016/aug/12/donald-trump-republicans-hillary-clinton-us-election-live", // Live blog
    "/sport/live/2016/aug/20/rio-2016-olympics-day-15-mo-farah-relays-tom-daley-nicola-adams-football-live", // Sport live blog
    "/somerset-county-council-partner-zone/2016/sep/21/somerset-offers-opportunities-develop-social-work-career" // Paid for by page
  ).foreach(testAmpPageValidity)
}
