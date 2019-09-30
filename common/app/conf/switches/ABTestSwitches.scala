package conf.switches

import common.editions._
import conf.switches.SwitchGroup.{ABTests, Commercial}
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-commercial-iab-compliant",
    "Test the IAB compliant version of our CMP",
    owners = Seq(Owner.withGithub("ripecosta")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 10, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-ask-four-earning",
    "This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 1, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-articles-viewed-month",
    "States how many articles a user has viewed in the epic in a month",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 1, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-learn-more-cta",
    "States how many articles a user has viewed in the epic in a month",
    owners = Seq(Owner.withGithub("jlieb10")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 1, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-country-name",
    "Displays country name in the epic",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 1, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-banner-articles-viewed",
    "show number of articles viewed in contributions banner",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-banner-environment-moment-supporters",
    "moment banner to be seen by current supporters",
    owners = Seq(Owner.withGithub("jlieb10")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-banner-environment-moment-non-supporters",
    "moment banner to be seen by general audience",
    owners = Seq(Owner.withGithub("jlieb10")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-always-ask-if-tagged",
    "This guarantees that any on any article that is tagged with a tag that is on the allowed list of tags as set by the tagging tool, the epic will be displayed",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = On,
    sellByDate = new LocalDate(2020, 1, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-prebid-safeframe",
    "Test the impact of serving prebid ads in safeframes",
    owners = Seq(Owner.withGithub("jeteve")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-outbrain-testing",
    "Test the outbrain widget",
    owners = Seq(Owner.withGithub("frankie297")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 4, 22),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-prebid-triple-lift-adapter",
    "Test the triple lift adapter in prebid",
    owners = Seq(Owner.withGithub("ioanna0")),
    safeState = On,
    sellByDate = new LocalDate(2020, 7, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-xaxis-adapter",
    "Test new implementation of xaxis adapter with multiple placement ids",
    owners = Seq(Owner.withGithub("ioanna0")),
    safeState = On,
    sellByDate = new LocalDate(2020, 7, 30),
    exposeClientSide = true
  )
}
