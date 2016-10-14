package conf.switches

import common.Edition
import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  val ABDiscussionExternalFrontend = Switch(
    SwitchGroup.ABTests,
    "ab-discussion-external-frontend",
    "Standalone frontend discussion",
    owners = Seq(Owner.withGithub("piuccio")),
    safeState = On,
    sellByDate = new LocalDate(2016, 11, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-discussion-promote-comments",
    "Promote the comments with a sticky bottom banner",
    owners = Seq(Owner.withGithub("nicl")),
    safeState = On,
    sellByDate = new LocalDate(2016, 11, 9),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-membership-engagement-immediate",
    "Test effectiveness of not waiting for 10 page reads before showing membership engagement banner to UK users.",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = On,
    sellByDate = new LocalDate(2016, 10, 18),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-weekend-reading-email",
    "Try out two formats for the Weekend Reading email",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 31),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-weekend-reading-promo",
    "Show visitors a snap banner to promote the Weekend Reading email",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 31),
    exposeClientSide = true
  )

}
