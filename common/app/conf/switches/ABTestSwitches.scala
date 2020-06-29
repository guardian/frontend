package conf.switches

import common.editions._
import conf.switches.SwitchGroup.{ABTests, Commercial}
import org.joda.time.LocalDate

trait ABTestSwitches {

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
    "ab-contributions-banner-articles-viewed",
    "show number of articles viewed in contributions banner",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-banner-articles-viewed-opt-out",
    "show number of articles viewed in contributions banner, along with tooltip allowing opting out",
    owners = Seq(Owner.withGithub("michaelbjacobson")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 11, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-covid-banner-round-two",
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
    "ab-commercial-redplanet",
    "Test Redplanet",
    owners = Seq(Owner.withGithub("ioanna0")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 10, 1),
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
    "ab-sign-in-gate-patientia",
    "Marathon sign in gate test on 2nd article view",
    owners = Seq(Owner.withGithub("coldlink"),Owner.withGithub("vlbee")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 12, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-centesimus-2",
    "Show sign in gate to 100% of users on 3rd article view",
    owners = Seq(Owner.withGithub("vlbee")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 12, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-remote-epic-variants",
    "Serve epics from remote service for subset of audience",
    owners = Seq(Owner.withGithub("nicl")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 7, 21),
    exposeClientSide = true,
  )

}
