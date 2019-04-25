package conf.switches

import common.editions._
import conf.switches.SwitchGroup.{ABTests, Commercial}
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-commercial-cmp-customise",
    "change the location and format of your CMP data",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 9, 30),
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
    "ab-contributions-global-mobile-banner-design",
    "testing mobile-only design changes",
    owners = Seq(Owner.withGithub("jlieb10")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 9, 30),
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
    "ab-commercial-ad-verification",
    "Test the impact of verifiyng ads",
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
    "ab-commercial-consent-global-no-scroll",
    "Test the consent banner on non-EEA users with & without the ability to scroll underlying content through the banner on mobile",
    owners = Owner.group(Commercial),
    safeState = Off,
    sellByDate = new LocalDate(2019, 5, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-consent-global-tall-banner",
    "Test whether increasing the height of the consent banner on non-EEA users increases proportion of users who interact with it",
    owners = Owner.group(Commercial),
    safeState = Off,
    sellByDate = new LocalDate(2019, 5, 24),
    exposeClientSide = true
  )
}
