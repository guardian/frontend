package conf.switches

import common.editions._
import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-glabs-traffic-driver",
    "Displays an ad slot that will drive traffic to GLabs content",
    owners = Seq(Owner.withGithub("JonNorman")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 9, 29),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-snippet-four-variants",
    "Measure snippet open rate based on snippet design",
    owners = Seq(Owner.withGithub("regiskuckaertz")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 10, 6),
    exposeClientSide = true
  )

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
    "ab-paid-content-vs-outbrain-2",
    "Displays a paid content widget instead of Outbrain",
    owners = Seq(Owner.withName("commercial team")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 1, 8),
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
    "ab-outstream-frequency-cap",
    "Test adds a hold-back variant which keeps a frequency cap on outstream video format ads.",
    owners = Seq(Owner.withGithub("rich-nguyen")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 11, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-support-us-recurring-contribution",
    "Test demand for recurring contributions in the US across all channels",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 10, 19),
    exposeClientSide = true
  )

}
