package conf.switches

import common.editions._
import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-contributions-epic-always-ask-strategy",
    "Test to assess the effects of always asking readers to contribute via the Epic over a prolonged period",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 7, 19),
    exposeClientSide = true
  )

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
    "ab-acquisitions-interactive-end",
    "This places the epic underneath certain interactives",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 7, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-election-interactive-slice",
    "This places the epic (slice design) in the middle of UK election-related interactives",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 7, 3),
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
    "ab-acquisitions-epic-always-ask-election",
    "This will guarantee that the epic is always displayed on election stories",
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
    sellByDate = new LocalDate(2018, 1, 16),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-unruly-performance-test",
    "Removes 5% of users from Unruly to measure performance impact",
    owners = Seq(Owner.withGithub("janua")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 2, 28),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-prebid-integration",
    "Test prebid as a header-bidding implementation",
    owners = Seq(Owner.withGithub("rich-nguyen")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 2),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-testimonials-group",
    "Test changing the epic testimonial each view",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 1, 16),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-colour-test-epic-holdback",
    "A holdback for the epic colour changes",
    owners = Seq(Owner.withGithub("Ap0c")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 2, 15),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-colour-test-banner-holdback",
    "A holdback for the banner colour changes",
    owners = Seq(Owner.withGithub("Ap0c")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 2, 15),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-commercial-baseline",
    "Serves the Commercial Stack as on Jan 1st, 2018",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 4, 10),
    exposeClientSide = true
  )

}
