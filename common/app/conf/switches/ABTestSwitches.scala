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
    "ab-increase-inline-ads-redux",
    "Displays more inline ads in articles on desktop",
    owners = Seq(Owner.withGithub("gidsg")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 17),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-editorial-email-variants",
    "Assign users to variants of our editorial emails",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-opinion-email-variants",
    "Assign users to variants of opinion emails",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-brexit",
    "Test whether we get a positive effect on membership/contribution by targeting the latest brexit articles",
    owners = Seq(Owner.withGithub("alexduf")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 4, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-always-ask-strategy",
    "Test to assess the effects of always asking readers to contribute via the Epic over a prolonged period",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-ask-four-earning",
    "This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-regulars-v2",
    "Test messages aimed at our regular readers",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-tailor-survey",
    "Integrate Tailor with ab tests",
    owners = Seq(Owner.withGithub("oilnam")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 4, 28),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-sleeve-notes-new-email-variant",
    "Assign some of the new sleeve notes subscribers to receive the new email",
    owners = Seq(Owner.withGithub("lmath")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-sleeve-notes-legacy-email-variant",
    "Assign some of the new sleeve notes subscribers to receive the old email",
    owners = Seq(Owner.withGithub("lmath")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-the-long-read-email-variants",
    "Assign users to variants of long read email",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-fashion-statement-email-variants",
    "Assign users to variants of fashion statement email",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-bookmarks-email-variants-2",
    "Assign users to variants of bookmarks email",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-film-today-email-variants",
    "Assign users to variants of film today email",
    owners = Seq(Owner.withGithub("davidfurey")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-article-50-trigger",
    "Display the Epic on Article 50 articles for readers in Europe",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 4, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-laundromat",
    "Display the Epic on Laundromat articles",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 4, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-email-demand-tests",
    "Test demand for a cities email",
    owners = Seq(Owner.withGithub("lmath")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 4, 21),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-paid-commenting-internal",
    "Paid commenting test",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 4, 27),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-paid-card-logo",
    "Trialling paid cards in editorial containers",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-vs-epic-and-engagement-banner",
    "Test displaying the Epic only vs the Epic and Engagement Banner",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 4, 19),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-epic-to-support-landing-page",
    "Use AB framework to divert traffic from epic to new support landing page",
    owners = Seq(Owner.withGithub("JustinPinner")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 4, 27),
    exposeClientSide = true
  )

}
