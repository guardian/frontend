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
    "ab-contributions-epic-usa-cta-three-way",
    "Test just contributions vs contributions or membership vs just membership in the US",
    owners = Seq(Owner.withGithub("philwills")),
    safeState = Off,
    sellByDate =  new LocalDate(2016, 11, 25),
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
