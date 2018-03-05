package conf.switches

import common.editions._
import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-contributions-epic-ask-four-earning",
    "This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 7, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-liveblog",
    "This places the epic below those blocks on liveblogs which have been marked for displaying the epic in Composer",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 7, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-always-ask-if-tagged",
    "This guarantees that any on any article that is tagged with a tag that is on the allowed list of tags as set by the tagging tool, the epic will be displayed",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = On,
    sellByDate = new LocalDate(2018, 7, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-thank-you",
    "Bootstrap the AB test framework to use the Epic to thank readers who have already supported the Guardian",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = On,
    sellByDate = new LocalDate(2018, 9, 5),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-us-gun-campaign-2017",
    "Show a custom Epic for articles with the US gun campaign tag",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = On,
    sellByDate = new LocalDate(2018, 3, 15),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-unruly-performance-test",
    "Removes 5% of users from Unruly to measure performance impact",
    owners = Seq(Owner.withGithub("janua")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 15),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-lazy-loading",
    "Varies the strategy for lazyloading of adverts",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-banner-cta-contribute",
    "Test a new CTA for the banner",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 14),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-australia-environment-campaign-2018",
    "Show a custom Epic for articles with the Australia environment campaign tag",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 15),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-header-subscribe-means-subscribe",
    "Point the subscribe link in the header to a subscriptions-only version of the support site",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 12),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-support-engagement-banner-circles",
    "When ON, the circles design test for the support engagement banner is ACTIVE",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 13), // Tues 13th March (but should be complete by the 8th)
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-support-epic-circles",
    "When ON, epic messaging will direct a share of the audience to the circles version of the support site",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 13), // Tues 13th March (but should be complete by the 8th)
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-header-eur-support",
    "Points the 'support the guardian' link in the header to the eur version of the support site",
    owners = Seq(Owner.withGithub("svillafe")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 17),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-engagement-banner-eur-support",
    "Points the 'support the guardian' link in the engagement banner to the eur version of the support site",
    owners = Seq(Owner.withGithub("svillafe")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 17),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-eur-support",
    "Points the 'support the guardian' link in the epic to the eur version of the support site",
    owners = Seq(Owner.withGithub("svillafe")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 17),
    exposeClientSide = true
  )
}
