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
    "/politics/2016/aug/09/tom-watson-interview-jeremy-corbyn-labour-rifts-hug-shout", // Feature tone
    "/travel/2016/aug/09/diggerland-kent-family-day-trips-in-uk", // Review tone
    "/global/2016/aug/09/guardian-weekly-letters-media-statues-predators", // Letters tone
    "/commentisfree/2016/aug/08/the-guardian-view-on-the-southern-train-strike-keep-the-doors-open-for-talks", // Editorials tone
    "/lifeandstyle/shortcuts/2016/aug/09/why-truck-drivers-are-sick-of-chips-with-everything", // Features tone
    "/business/2016/aug/09/china-uk-investment-key-questions-following-hinkley-point-c-delay", // Analysis tone
    "/books/2011/aug/24/jorge-luis-borges-google-doodle", // More on this story
    "/uk-news/2016/aug/09/southern-rail-strike-war-of-words-heats-up-on-second-day", // Story package / tone news
    "/football/2016/jul/10/france-portugal-euro-2016-match-report", // Match summary
    "/education/2016/aug/23/ofsted-chair-david-hoare-quits-after-isle-of-wight-ghetto-remarks" // Page with a richlink
  ).foreach(testAmpPageValidity)
}
