package model

import conf.switches.Switches
import conf.{Configuration, Static}
import layout.FaciaContainer

case class Badge(seriesTag: String, imageUrl: String, classModifier: Option[String] = None)

object Badges {
  private val euSvg = Static("images/badges/eu-ref.svg")

  val usElection = Badge("us-news/us-elections-2016", Static("images/badges/us-election.png"), Some("us-election"))
  val ausElection = Badge("australia-news/australian-election-2016", Static("images/badges/aus-election.png"), Some("aus-election"))
  val voicesOfAmerica = Badge("us-news/series/voices-of-america", Static("images/badges/voices-of-america.svg"), Some("voices-of-america"))

  val euElection = Badge("politics/eu-referendum", euSvg)
  val euRealityCheck = Badge("politics/series/eu-referendum-reality-check", euSvg)
  val euBriefing = Badge("politics/series/eu-referendum-morning-briefing", euSvg)
  val euSparrow = Badge("politics/series/eu-referendum-live-with-andrew-sparrow", euSvg)

  val allBadges = Seq(usElection, ausElection, voicesOfAmerica, euElection, euRealityCheck, euBriefing, euSparrow)

  def badgeFor(c: ContentType) = c.tags.tags.map(_.id).foldLeft(None: Option[Badge]) { (maybeBadge, tag) =>
      maybeBadge orElse allBadges.find(b => b.seriesTag == tag)
  }

  def badgeFor(fc: FaciaContainer) = fc.href.flatMap(href => allBadges.find(badge => href == badge.seriesTag))
}
