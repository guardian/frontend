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
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-always-ask-if-tagged",
    "This guarantees that any on any article that is tagged with a tag that is on the allowed list of tags as set by the tagging tool, the epic will be displayed",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = On,
    sellByDate = new LocalDate(2025, 1, 27),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-commercial-prebid-safeframe",
    "Test the impact of serving prebid ads in safeframes",
    owners = Seq(Owner.withGithub("jeteve")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 1, 20),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-main-control",
    "Control audience for the sign in gate to 9% audience. Will never see the sign in gate.",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 12, 1),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-main-variant",
    "Show sign in gate to 90% of users on 3rd article view, variant/full audience",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 12, 1),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-curated-container-test2",
    "Tests an additional 'curated' onwards container below the article body that is relevant to the article's pillar.",
    owners = Seq(Owner.withGithub("rcrphillips")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 1, 6),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-newsletter-embeds3",
    "New newsletter signup embeds for discoverability OKR",
    owners = Seq(Owner.withGithub("buck06191")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 1, 4),
    exposeClientSide = true,
  )

  val GlobalEoyHeaderSwitch = Switch(
    ABTests,
    "ab-global-eoy-header-test",
    "Test reader revenue message in header",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 2, 1),
    exposeClientSide = true,
  )
}
