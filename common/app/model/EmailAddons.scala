package model

import conf.Static

sealed trait EmailContent {
  def banner: String
  def test(a: Article): Boolean
}

case object ArtWeekly extends EmailContent {
  val banner = "art-weekly.png"
  def test(a: Article) = false // TODO: update with actual check
}

case object GreenLight extends EmailContent {
  val banner = "green-light.png"
  def test(a: Article) = false // TODO: update with actual check
}

case object MoneyTalks extends EmailContent {
  val banner = "money-talks.png"
  def test(a: Article) = false // TODO: update with actual check
}

case object PovertyMatters extends EmailContent {
  val banner = "poverty-matters.png"
  def test(a: Article) = false // TODO: update with actual check
}

case object TheBreakdown extends EmailContent {
  val banner = "the-breakdown.png"
  def test(a: Article) = false // TODO: update with actual check
}

case object TheFiver extends EmailContent {
  val banner = "the-fiver.png"
  def test(a: Article) = a.content.tags.series.exists(_.id == "football/series/thefiver")
}

case object TheSpin extends EmailContent {
  val banner = "the-spin.png"
  def test(a: Article) = false // TODO: update with actual check
}

object EmailAddons {
  private val defaultBanner = "generic.png"
  private val allEmails     = Seq(ArtWeekly, GreenLight, MoneyTalks, PovertyMatters, TheBreakdown, TheFiver, TheSpin)

  implicit class EmailArticle(a: Article) {
    lazy val banner = {
      val banner = emailFor(a) map (_.banner) getOrElse defaultBanner
      Static(s"images/email/banners/$banner").path
    }
  }

  private def emailFor(a: Article): Option[EmailContent] = allEmails.find(_.test(a))
}
