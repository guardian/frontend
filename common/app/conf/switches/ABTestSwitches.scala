package conf.switches

import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

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
    "ab-contributions-membership-epic-cta-united-states-two",
    "Find optimal way to present contributions and membership asks in Epic component for US",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate =  new LocalDate(2016, 11, 11),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-membership-epic-cta-rest-of-world-two",
    "Find optimal way to present contributions and membership asks in Epic component for not US",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate =  new LocalDate(2016, 11, 11),
    exposeClientSide = true
  )

}
