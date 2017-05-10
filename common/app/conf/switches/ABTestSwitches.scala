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
    "ab-increase-inline-ads-redux-redux",
    "Displays more inline ads in articles on desktop",
    owners = Seq(Owner.withGithub("gidsg")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 29),
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
    "ab-contributions-epic-always-ask-strategy",
    "Test to assess the effects of always asking readers to contribute via the Epic over a prolonged period",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 6, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-ask-four-earning",
    "This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 6, 1),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-liveblog",
    "This places the epic below those blocks on liveblogs which have been marked for displaying the epic in Composer",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 7, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-tailor-survey",
    "Integrate Tailor with ab tests",
    owners = Seq(Owner.withGithub("oilnam")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 31),
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
    "ab-paid-commenting-internal",
    "Paid commenting test",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 5, 25),  // Thurs 25th May
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
    sellByDate = new LocalDate(2017, 5, 25),  // Thursday
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-testimonials",
    "Test placing reader testimonials in the Epic",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = On,
    sellByDate = new LocalDate(2017, 5, 10),
    exposeClientSide = true
  )
}
