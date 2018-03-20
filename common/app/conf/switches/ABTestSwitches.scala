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
    sellByDate = new LocalDate(2019, 3, 14),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-lazy-loading-extended",
    "Varies the strategy for lazyloading of adverts",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-australia-environment-campaign-2018",
    "Show a custom Epic for articles with the Australia environment campaign tag",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 3, 14),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-header-subscribe-means-subscribe",
    "Point the subscribe link in the header to a subscriptions-only version of the support site",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 3, 26),
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

  Switch(
    ABTests,
    "ab-spacefinder-simplify",
    "Alters the rules for inserting ads on desktop breakpoints.",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 6),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-header-aud-support",
    "Points the 'support the guardian' link in the header to the aud version of the support site",
    owners = Seq(Owner.withGithub("svillafe")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-engagement-banner-aud-support",
    "Points the 'support the guardian' link in the engagement banner to the aud version of the support site",
    owners = Seq(Owner.withGithub("svillafe")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-aud-support",
    "Points the 'support the guardian' link in the epic to the aud version of the support site",
    owners = Seq(Owner.withGithub("svillafe")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-engagement-banner-uk-17-pence",
    "Tests a CTA message that aims to push people towards recurring contributions in the UK",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-engagement-banner-us-23-cents",
    "Tests a CTA message that aims to push people towards recurring contributions in the US",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 24),
    exposeClientSide = true
  )
}
