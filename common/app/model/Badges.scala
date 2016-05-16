package model

import conf.{Configuration, Static}

case class Badge(seriesTag: String, imageUrl: String)

object Badges {
  val usElection = Badge("us-news/us-elections-2016", s"${Configuration.static.path}/sys-images/Guardian/Pix/pictures/2016/2/2/1454424596176/USElectionlogooffset.png")
  val ausElection = Badge("australia-news/australian-election-2016", Static("images/AUSElectionBadge.png").toString)

  val allBadges = Seq(usElection, ausElection)

  implicit class ContentTypeBadge(c: ContentType) {
    val badge = allBadges.find(badge => c.tags.series.exists(tag => tag == badge.seriesTag))
  }
}
