package model

import conf.Static

sealed trait EmailContent extends Product with Serializable {
  def name: String
  def banner: String
  def test(c: ContentType): Boolean
  def address: Option[String] = None
}

case object ArtWeekly extends EmailContent {
  val name = "Art Weekly"
  val banner = "art-weekly.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "artanddesign/series/art-weekly")
}

case object GreenLight extends EmailContent {
  val name = "Green Light"
  val banner = "green-light.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "environment/series/green-light")
}

case object MoneyTalks extends EmailContent {
  val name = "Money Talks"
  val banner = "money-talks.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "money/series/money-talks")
}

case object PovertyMatters extends EmailContent {
  val name = "Poverty Matters"
  val banner = "poverty-matters.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "global-development/series/poverty-matters")
}

case object TheBreakdown extends EmailContent {
  val name = "The Breakdown"
  val banner = "the-breakdown.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "sport/series/breakdown")
}

case object TheFiver extends EmailContent {
  val name = "The Fiver"
  val banner = "the-fiver.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "football/series/thefiver")
}

case object TheSpin extends EmailContent {
  val name = "The Spin"
  val banner = "the-spin.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "sport/series/thespin")
}

case object MorningBriefing extends EmailContent {
  val name = "Morning Briefing"
  val banner = "morning-briefing.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "world/series/guardian-morning-briefing")
}

case object TheUSMinute extends EmailContent {
  val name = "The campaign minute 2016"
  val banner = "the-us-minute.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "us-news/series/the-campaign-minute-2016")
}

case object USBriefing extends EmailContent {
  val name = "Guardian US Briefing"
  val banner = "guardian-us-briefing.png"
  override val address = Some("222 Broadway, 22nd and 23rd Floors, New York, New York, 10038")
  def test(c: ContentType) = c.tags.series.exists(_.id == "us-news/series/guardian-us-briefing")
}

case object AusBriefing extends EmailContent {
  val name = "Australian election briefing"
  val banner = "australian-election-briefing.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "australia-news/series/australian-election-briefing")
}

case object EuReferendum extends EmailContent {
  val name = "EU Referendum Morning Briefing"
  val banner = "eu-referendum.png"
  def test(c: ContentType) = c.tags.series.exists(_.id == "politics/series/eu-referendum-morning-briefing")
}

object EmailAddons {
  private val defaultAddress = "Kings Place, 90 York Way, London, N1 9GU. Registered in England No. 908396"
  private val defaultBanner = "generic.png"
  private val allEmails     = Seq(
    ArtWeekly,
    GreenLight,
    MoneyTalks,
    PovertyMatters,
    TheBreakdown,
    TheFiver,
    TheSpin,
    MorningBriefing,
    TheUSMinute,
    USBriefing,
    AusBriefing,
    EuReferendum)

  implicit class EmailContentType(c: ContentType) {
    val email = allEmails.find(_.test(c))

    val fallbackSeriesText = if (email.isEmpty) c.content.seriesName else None

    lazy val banner = {
      val banner = email map (_.banner) getOrElse defaultBanner
      Static(s"images/email/banners/$banner")
    }

    lazy val address = email flatMap (_.address) getOrElse defaultAddress
  }
}
