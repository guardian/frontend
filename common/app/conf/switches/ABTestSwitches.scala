package conf.switches

import common.editions._
import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-contributions-epic-ask-four-earning",
    "This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 1, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-new-sign-in-experiment-bump",
    "This test will send a % of users to the new sign in experience",
    owners = Seq(Owner.withGithub("walaura")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 6, 7),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-liveblog",
    "This places the epic below those blocks on liveblogs which have been marked for displaying the epic in Composer",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 1, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-always-ask-if-tagged",
    "This guarantees that any on any article that is tagged with a tag that is on the allowed list of tags as set by the tagging tool, the epic will be displayed",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = On,
    sellByDate = new LocalDate(2019, 1, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-thank-you",
    "Bootstrap the AB test framework to use the Epic to thank readers who have already supported the Guardian",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = On,
    sellByDate = new LocalDate(2019, 1, 24),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-us-gun-campaign-2017",
    "Show a custom Epic for articles with the US gun campaign tag",
    owners = Seq(Owner.withGithub("Mullefa")),
    safeState = On,
    sellByDate = new LocalDate(2019, 3, 14),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-australia-environment-campaign-2018",
    "Show a custom Epic for articles with the Australia environment campaign tag",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 3, 14),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-from-google-doc-one-variant",
    "Serves an epic with copy from a Google Doc",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 6, 5),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-from-google-doc-two-variants",
    "Serves an epic with copy from a Google Doc",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 6, 5),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-from-google-doc-three-variants",
    "Serves an epic with copy from a Google Doc",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 6, 5),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-from-google-doc-four-variants",
    "Serves an epic with copy from a Google Doc",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 6, 5),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-acquisitions-epic-from-google-doc-five-variants",
    "Serves an epic with copy from a Google Doc",
    owners = Seq(Owner.withGithub("joelochlann")),
    safeState = Off,
    sellByDate = new LocalDate(2019, 6, 5),
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
    "ab-acquisitions-epic-thailand-cave",
    "Always show the epic on thailand cave stories (unlimited)",
    owners = Seq(Owner.withGithub("tsop14")),
    safeState = Off,
    sellByDate = new LocalDate(2018, 9, 28),
    exposeClientSide = true
  )

}
