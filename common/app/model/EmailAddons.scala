package model

import conf.Static

sealed trait EmailContent {
  def banner: String
  def test(a: Article): Boolean
}

case object ArtWeekly extends EmailContent {
  val banner = "art-weekly.png"
  def test(a: Article) = a.content.tags.series.exists(_.id == "artanddesign/series/art-weekly")
}

case object GreenLight extends EmailContent {
  val banner = "green-light.png"
  def test(a: Article) = a.content.tags.series.exists(_.id == "environment/series/green-light")
}

case object MoneyTalks extends EmailContent {
  val banner = "money-talks.png"
  def test(a: Article) = a.content.tags.series.exists(_.id == "money/series/money-talks")
}

case object PovertyMatters extends EmailContent {
  val banner = "poverty-matters.png"
  def test(a: Article) = a.content.tags.blogs.exists(_.id == "global-development/poverty-matters")
}

case object TheBreakdown extends EmailContent {
  val banner = "the-breakdown.png"
  def test(a: Article) = a.content.tags.series.exists(_.id == "sport/series/breakdown")
}

case object TheFiver extends EmailContent {
  val banner = "the-fiver.png"
  def test(a: Article) = a.content.tags.series.exists(_.id == "football/series/thefiver")
}

case object TheSpin extends EmailContent {
  val banner = "the-spin.png"
  def test(a: Article) = a.content.tags.series.exists(_.id == "sport/series/thespin")
}

object EmailAddons {
  private val defaultBanner = "generic.png"
  private val allEmails     = Seq(ArtWeekly, GreenLight, MoneyTalks, PovertyMatters, TheBreakdown, TheFiver, TheSpin)

  implicit class EmailArticle(a: Article) {
    val email = allEmails.find(_.test(a))

    lazy val banner = {
      val banner = email map (_.banner) getOrElse defaultBanner
      Static(s"images/email/banners/$banner").path
    }
  }
}
