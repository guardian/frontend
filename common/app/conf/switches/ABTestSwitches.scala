package conf.switches

import common.Edition
import conf.switches.SwitchGroup.ABTests
import org.joda.time.LocalDate

trait ABTestSwitches {

  Switch(
    ABTests,
    "ab-live-blog-chrome-notifications-prod2",
    "Live blog chrome notifications - prod",
    owners = Seq(Owner.withGithub("janua")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-discussion-promote-comments",
    "Promote the comments with a sticky bottom banner",
    owners = Seq(Owner.withGithub("piuccio")),
    safeState = On,
    sellByDate = new LocalDate(2016, 10, 12),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-contributions-story",
    "Test whether telling the story of the guardian through 3 staggered messages over time in a component at the end of an article results in more contributions than always showing the epic component at the end of an article (which was a long message of text over 3 paragraphs)",
    owners = Seq(Owner.withGithub("jranks123")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 6),
    exposeClientSide = true
  )

  for (edition <- Edition.all) Switch(
    ABTests,
    "ab-membership-engagement-banner-"+edition.id.toLowerCase,
    "Test effectiveness of header for driving contributions vs membership.",
    owners = Seq(Owner.withGithub("rtyley")),
    safeState = On,
    sellByDate = new LocalDate(2017, 9, 8),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-ad-blocking-response3",
    "Prominent adblocker ad-free test",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 13),   // Thursday @ 23:59 BST
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-weekend-reading-email",
    "Try out two formats for the Weekend Reading email",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-weekend-reading-promo",
    "Show visitors a snap banner to promote the Weekend Reading email",
    owners = Seq(Owner.withGithub("katebee")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 3),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-video-button-duration",
    "Show visitors new video play button",
    owners = Seq(Owner.withGithub("mr-mr")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 30),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-upgrade-mobile-rich-links-below-viewport",
    "Only upgrade rich links if they are below the current viewport",
    owners = Seq(Owner.withGithub("gtrufitt")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 10, 13),
    exposeClientSide = true
  )
}
