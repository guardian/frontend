package model

import conf.Static

sealed trait EmailContent {
  def banner: String
  def test(a: Article): Boolean
}

case object TheFiver extends EmailContent {
  val banner = "the-fiver.png"
  def test(a: Article) = a.content.tags.series.exists(_.id == "football/series/thefiver")
}

object EmailAddons {
  private val defaultBanner = "default.jpg"
  private val allEmails     = Seq(TheFiver)

  implicit class EmailArticle(a: Article) {
    lazy val banner = {
      val banner = emailFor(a) map (_.banner) getOrElse defaultBanner
      Static(s"images/email/banners/$banner").path
    }
  }

  private def emailFor(a: Article): Option[EmailContent] = allEmails.find(_.test(a))
}
