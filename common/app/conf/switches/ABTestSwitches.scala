package conf.switches

import common.editions._
import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  for ((edition, testId) <- Map(
    International -> "ab-membership-engagement-international-experiment-test12",
    Au -> "ab-au-memb-engagement-msg-copy-test8"
  )) Switch(
    SwitchGroup.ABTests,
    testId,
    s"Test effectiveness of engagement banners in the $edition edition for driving Membership & Contributions.",
    owners = Seq(Owner.withGithub("rtyley")),
    safeState = On,
    sellByDate = new LocalDate(2017, 9, 8), // we'll be doing AB tests on this for a long time, don't want to break the build
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-explainer-snippet",
    "Displays an explainer in the form of a disclosure widget",
    owners = Seq(Owner.withGithub("regiskuckaertz")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 6, 13),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-opinion-email-variants",
    "Assign users to variants of opinion emails",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 6, 19),
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
    "ab-acquisitions-election-interactive-end",
    "This places the epic underneath UK election-related interactives",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 7, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-election-interactive-slice",
    "This places the epic (slice design) in the middle of UK election-related interactives",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 7, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-this-land-series-epic",
    "This places a custom Epic at the ehnd of This Land Is Your Land articles",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 8, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-this-land-environment-epic-earning",
    "This places a custom Epic at the ennd of environment articles",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 8, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-this-land-environment-epic-learning",
    "This places a custom Epic at the ennd of environment articles",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 8, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-liveblog-design-test",
    "This tests some different designs of the liveblog epic",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 7, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-tailor-survey",
    "Integrate Tailor with ab tests",
    owners = Seq(Owner.withGithub("oilnam"), Owner.withGithub("mike-ruane")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 8, 31),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-bookmarks-email-variants-2",
    "Assign users to variants of bookmarks email",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 6, 19),
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
    "ab-bundle-digital-sub-price-test-1-m",
    "Test pricing options for digital subs",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 7, 6),  // Thursday 6th July
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
    "ab-acquisitions-epic-testimonials-usa",
    "Test placing localised reader testimonials in the Epic",
    owners = Seq(Owner.withGithub("desbo")),
    safeState = On,
    sellByDate = new LocalDate(2017, 6, 26),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-thank-you",
    "Bootstrap the AB test framework to use the Epic to thank readers who have already supported the Guardian",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = On,
    sellByDate = new LocalDate(2017, 6, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-thrasher-uk-election",
    "Bootstrap the AB test framework to show a different UK election thrasher to supporters/non-supporters respectively",
    owners = Seq(Owner.withGithub("Mullefa"), Owner.withGithub("joelochlann")),
    safeState = On,
    sellByDate = new LocalDate(2017, 7, 3),
    exposeClientSide = true
  )
}
