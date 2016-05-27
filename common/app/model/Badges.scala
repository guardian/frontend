package model

import conf.switches.Switches
import conf.{Configuration, Static}
import layout.FaciaContainer

case class Badge(seriesTag: String, imageUrl: String)

object Badges {
  val usElection = Badge("us-news/us-elections-2016", Static("images/USElectionlogooffset.png").path)
  val ausElection = Badge("australia-news/australian-election-2016", Static("images/AUSElectionBadge.png").path)
  val euElection = Badge("politics/eu-referendum", Static("images/EU_Ref_Logo.svg").path)
  val euRealityCheck = Badge("politics/series/eu-referendum-reality-check", Static("images/EU_Ref_Logo.svg").path)

  val allBadges = Seq(usElection, ausElection, euRealityCheck) ++ {
    if (Switches.EuReferendumBadgeSwitch.isSwitchedOn) Seq(euElection)
    else Seq()
  }

  def badgeFor(c: ContentType) = c.tags.tags.map(_.id).foldLeft(None: Option[Badge]) { (maybeBadge, tag) =>
      maybeBadge orElse allBadges.find(b => b.seriesTag == tag)
  }

  def badgeFor(fc: FaciaContainer) = fc.href.flatMap(href => allBadges.find(badge => href == badge.seriesTag))
}
