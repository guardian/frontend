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
    "ab-discussion-external-frontend-avatar",
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
    owners = Seq(Owner.withGithub("piuccio")),
    safeState = On,
    sellByDate = new LocalDate(2016, 10, 12),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-hosted-article-onward-journey",
    "Vertical positioning of the onward journey links",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 29),
    exposeClientSide = true
  )

  Switch(
    ABTests,
    "ab-hosted-gallery-cta",
    "Test which gallery image to put the call to action link on",
    owners = Seq(Owner.withGithub("lps88")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 29),
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

  Switch(
    ABTests,
    "ab-contributions-epic-20160916",
    "Test variants of the button text to drive contributions.",
    owners = Seq(Owner.withGithub("markjamesbutler")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 27),
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
    "ab-ad-blocking-response2",
    "Prominent adblocker response test",
    owners = Seq(Owner.withGithub("justinpinner")),
    safeState = Off,
    sellByDate = new LocalDate(2016, 9, 29),   // Thursday @ 23:59 BST
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
}
