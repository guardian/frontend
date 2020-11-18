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
    "ab-contributions-banner-articles-viewed-opt-out",
    "show number of articles viewed in contributions banner, along with tooltip allowing opting out",
    owners = Seq(Owner.withGithub("paulbrown1982")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 11, 27),
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
    sellByDate = new LocalDate(2020, 12, 1),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-sign-in-gate-main-variant",
    "Show sign in gate to 90% of users on 3rd article view, variant/full audience",
    owners = Seq(Owner.withGithub("coldlink")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 12, 1),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-curated-container-test",
    "Tests an additional 'curated' onwards container below the article body.",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 12, 9),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-liveblog-epic-design-test-r2",
    "Test designs for the liveblog epic",
    owners = Seq(Owner.withGithub("tomrf1")),
    safeState = Off,
    sellByDate = new LocalDate(2021, 1, 1),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-newsletter-merch-unit-lighthouse-control",
    "Test impact of newsletter merch unit across lighthouse segments (Control bucket)",
    owners = Seq(Owner.withGithub("buck06191")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 12, 1),
    exposeClientSide = true,
  )

  Switch(
    ABTests,
    "ab-newsletter-merch-unit-lighthouse-variants",
    "Test impact of newsletter merch unit across lighthouse segments (Variant buckets)",
    owners = Seq(Owner.withGithub("buck06191")),
    safeState = Off,
    sellByDate = new LocalDate(2020, 12, 1),
    exposeClientSide = true,
  )
}
