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
    sellByDate = new LocalDate(2016, 11, 7),
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
    "ab-weekend-reading-email",
    "Try out two formats for the Weekend Reading email",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 11, 21),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-hosted-onward-journey",
    "Show more pages from the campaign in Hosted Article/Video pages, using a carousel or popup",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2017, 1, 18),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-membership-engagement-message-copy-experiment",
    "Test alternate short messages on membership engagement banner",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = On, // so we don't inadvertently turn off during deployment
    sellByDate = new LocalDate(2016, 11, 10), // Thursday night
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-membership-engagement-us-message-copy-experiment",
    "Test alternate short messages on US membership engagement banner",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 11, 15),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-membership-epic-brexit",
    "Find the optimal way of offering Contributions along side Membership in the Epic component on articles about Brexit",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = On,
    sellByDate =  new LocalDate(2016, 11, 7),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-membership-epic-side-by-side",
    "Find out if offering membership and contributions side by side with equal weighting is as effective as just offering membership by itself",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = On,
    sellByDate =  new LocalDate(2016, 11, 7),
    exposeClientSide = true
  )
}
