package conf.switches

import common.Edition
import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-live-blog-chrome-notifications-prod2",
    "Live blog chrome notifications - prod",
    owners = Seq(Owner.withGithub("janua")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-discussion-external-frontend-count",
    "Standalone frontend discussion",
    owners = Seq(Owner.withGithub("piuccio")),
    safeState = On,
    sellByDate = new LocalDate(2016, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-hosted-article-onward-journey",
    "Vertical positioning of the onward journey links",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 16),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-hosted-gallery-cta",
    "Test which gallery image to put the call to action link on",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 16),
    exposeClientSide = true
  )


  val ABContributionsEmbed20160905= Switch(
    ABTests,
    "ab-contributions-embed-20160905",
    "Test whether contributions embed performs better inline and in-article than at the bottom of the article.",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 20),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-20160906",
    "Test whether contributions embed performs better than our previous in-article component tests.",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 20),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-buttons-20160907",
    "Test whether adding the amount buttons to the epic increases the impressions to conversions rate.",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 20),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-participation-discussion-ordering-live-blog",
    "Test to see whether ordering comments by recommends on live blogs increases the number oof people who read them",
    owners = Seq(Owner.withGithub("NathanielBennett")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 16), //Wednesday
    exposeClientSide = true
  )

  for (edition <- Edition.all) Switch(
    ABTests,
    "ab-membership-engagement-banner-"+edition.id.toLowerCase,
    "Test effectiveness of header for driving contributions vs membership.",
    owners = Seq(Owner.withGithub("rtyley")),
    safeState = On,
    sellByDate = new LocalDate(2017, 9, 8),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-ad-feedback",
    "Solicit feedback for ad impressions",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 14),  // Wednesday
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-recommended-for-you",
    "Test demand for a personalised container on fronts",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 16),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-ad-blocking-response",
    "Prominent adblocker response test",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 18),   // Tuesday
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-weekend-reading-email",
    "Try out two formats for the Weekend Reading email",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-weekend-reading-promo",
    "Show visitors a snap banner to promote the Weekend Reading email",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 3),
    exposeClientSide = true
  )
}
