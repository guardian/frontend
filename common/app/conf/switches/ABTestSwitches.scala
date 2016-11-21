package conf.switches

import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

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
    "ab-membership-engagement-international-experiment",
    "Test varying the number of visits before showing the membership engagement banner",
    owners = Seq(Owner.withGithub("rupert.bates")),
    safeState = On,
    sellByDate = new LocalDate(2016, 12, 1), // Thursday 1st December
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-fake-news",
    "Try and beat the epic copy with e version that mentions the hot topic of fake news",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate =  new LocalDate(2016, 11, 22),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-epic-usa-cta-fake-news",
    "Test just contributions vs contributions or membership in the US, and test a new copy variant against the control",
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

  Switch(
    ABTests,
    "ab-platform-sticky-ad-viewability",
    "Test the affect of showing the navigation on the viewability of the sticky top ad",
    owners = Seq(Owner.withGithub("gtrufitt"), Owner.withName("Gareth Trufitt")),
    safeState = Off,
    sellByDate =  new LocalDate(2016, 11, 24),
    exposeClientSide = true
  )



}
