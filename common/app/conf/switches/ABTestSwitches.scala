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
    sellByDate = new LocalDate(2016, 11, 15),
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
    sellByDate = new LocalDate(2016, 11, 17), // Thursday night
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
    "ab-membership-engagement-international-experiment",
    "Test varying the number of visits before showing the membership engagement banner",
    owners = Seq(Owner.withGithub("rupert.bates")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 11, 17),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-limited-impressions",
    "Run the epic with a limit of 4 impressions per user (for non US, US there is no limit)",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate =  new LocalDate(2016, 11, 22),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-thank-you",
    "Show a thank you message to our supporters at the end of artciles, just saying thanks!",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate =  new LocalDate(2016, 11, 22),
    exposeClientSide = true
  )


}
