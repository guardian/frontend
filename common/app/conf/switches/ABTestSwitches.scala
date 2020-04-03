package conf.switches

import common.editions._
import conf.switches.SwitchGroup.{ABTests, Commercial}
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-contributions-epic-precontribution-reminder-round-two",
    "Test the effect of the reminder on conversion rate",
    owners = Seq(Owner.withGithub("jlieb10")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 7, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-ask-four-earning",
    "This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2025, 1, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-liveblog-design-test-r1",
    "Test new designs for the liveblog",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = new LocalDate(2025, 1, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-banner-articles-viewed",
    "show number of articles viewed in contributions banner",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-covid-banner-round-one",
    "Covid crisis",
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
    sellByDate = new LocalDate(2025, 1, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-prebid-safeframe",
    "Test the impact of serving prebid ads in safeframes",
    owners = Seq(Owner.withGithub("jeteve")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 1, 20),
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

  Switch(
    ABTests,
    "ab-commercial-pangaea-adapter",
    "Test adding pangaea in prebid in US & AU regions",
    owners = Seq(Owner.withGithub("ioanna0")),
    safeState = On,
    sellByDate = new LocalDate(2020, 7, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-appnexus-us-adapter",
    "Test new us placement id for appnexus in US",
    owners = Seq(Owner.withGithub("ioanna0")),
    safeState = On,
    sellByDate = new LocalDate(2020, 7, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-a9",
    "Test Amazon A9 header bidding",
    owners = Seq(Owner.withGithub("ioanna0")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 9, 4),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-connatix",
    "Test Connatix Integration",
    owners = Seq(Owner.withGithub("ioanna0")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 12, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-tertius",
    "Test new sign in component on 2nd article view",
    owners = Seq(Owner.withGithub("coldlink"),Owner.withGithub("dominickendrick")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 5, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-frontend-dotcom-rendering-epic",
    "A/B test Default Epic on Frontend vs DCR, both from a remote source, to compare Epic performance",
    owners = Seq(Owner.withGithub("andre1050")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 5, 13),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-gpt-path",
    "0% a/b test for new gpt.js path",
    owners = Seq(Owner.withGithub("GHaberis")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 4, 27),
    exposeClientSide = true
  )
}
