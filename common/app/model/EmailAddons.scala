package model

import conf.Static


sealed trait EmailMetadata[T] extends Product with Serializable {
  def name: String
  def banner: Option[String] = None
  def address: Option[String] = None
  def test(c: T): Boolean
}

sealed trait ArticleEmailMetadata extends EmailMetadata[ContentPage] {
  def test(c: ContentPage): Boolean
}

sealed trait FrontEmailMetadata extends EmailMetadata[PressedPage] {
  def test(p: PressedPage): Boolean = p.metadata.webTitle == this.name
}

case object ArtWeekly extends ArticleEmailMetadata {
  val name = "Art Weekly"
  override val banner = Some("art-weekly.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "artanddesign/series/art-weekly")
}

case object DocumentariesUpdate extends ArticleEmailMetadata {
  val name = "Documentaries Update"
  override val banner = Some("documentaries.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "news/series/guardian-documentaries-update")
}

case object GreenLight extends ArticleEmailMetadata {
  val name = "Green Light"
  override val banner = Some("green-light.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "environment/series/green-light")
}

case object MoneyTalks extends ArticleEmailMetadata {
  val name = "Money Talks"
  override val banner = Some("money-talks.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "money/series/money-talks")
}

case object PovertyMatters extends ArticleEmailMetadata {
  val name = "Poverty Matters"
  override val banner = Some("poverty-matters.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "global-development/series/poverty-matters")
}

case object TheBreakdown extends ArticleEmailMetadata {
  val name = "The Breakdown"
  override val banner = Some("the-breakdown.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "sport/series/breakdown")
}

case object TheFiver extends ArticleEmailMetadata {
  val name = "The Fiver"
  override val banner = Some("the-fiver.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "football/series/thefiver")
}

case object TheSpin extends ArticleEmailMetadata {
  val name = "The Spin"
  override val banner = Some("the-spin.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "sport/series/thespin")
}

case object MorningBriefing extends ArticleEmailMetadata {
  val name = "Morning Briefing"
  override val banner = Some("morning-briefing.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "world/series/guardian-morning-briefing")
}

case object TheUSMinute extends ArticleEmailMetadata {
  val name = "The campaign minute 2016"
  override val banner = Some("the-us-minute.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "us-news/series/the-campaign-minute-2016")
}

case object USBriefing extends ArticleEmailMetadata {
  val name = "Guardian US Briefing"
  override val banner = Some("guardian-us-briefing.png")
  override val address = Some("222 Broadway, 22nd and 23rd Floors, New York, New York, 10038")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "us-news/series/guardian-us-briefing")
}

case object AusBriefing extends ArticleEmailMetadata {
  val name = "Australian election briefing"
  override val banner = Some("australian-election-briefing.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "australia-news/series/australian-election-briefing")
}

case object EuReferendum extends ArticleEmailMetadata {
  val name = "EU Referendum Morning Briefing"
  override val banner = Some("eu-referendum.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "politics/series/eu-referendum-morning-briefing")
}

case object LabNotes extends ArticleEmailMetadata {
  val name = "Lab Notes"
  override val banner = Some("lab-notes.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "science/series/lab-notes")
}

case object OlympicsDailyBriefing extends ArticleEmailMetadata {
  val name = "Olympics Daily Briefing"
  override val banner = Some("olympics-daily-briefing.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "sport/series/olympics-2016-daily-briefing")
}

case object HandwrittenMediaBriefing extends ArticleEmailMetadata {
  val name = "Media Briefing"
  override val banner = Some("media-briefing.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "media/series/mediaguardian-briefing")
}

case object CuratedMediaBriefing extends FrontEmailMetadata {
  val name = "Media Briefing"
  override val banner = Some("media-briefing.png")
}

case object VaginaDispatches extends ArticleEmailMetadata {
  val name = "Vagina Dispatches"
  override val banner = Some("vagina-dispatches.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "lifeandstyle/series/vagina-dispatches-newsletter")
}

case object KeepItInTheGround extends ArticleEmailMetadata {
  val name = "Keep It In The Ground"
  override val banner = Some("keep-it-in-the-ground.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "environment/series/keep-it-in-the-ground-updates")
}

case object TheWeekInPatriarchy extends ArticleEmailMetadata {
  val name = "The Week In Patriarchy"
  override val banner = Some("this-week-in-the-patriarchy.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "world/series/the-week-in-patriarchy")
}

case object OutsideInAmerica extends ArticleEmailMetadata {
  val name = "Outside in America"
  override val banner = Some("outside-in-america.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "us-news/series/outside-in-america-newsletter")
}

case object TheResistanceNow extends ArticleEmailMetadata {
  val name = "The Resistance Now"
  override val banner = Some("the-resistance-now.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "us-news/series/the-resistance-now-newsletter")
}

case object BeyondTheBlade extends ArticleEmailMetadata {
  val name = "Beyond The Blade"
  override val banner = Some("beyond-the-blade.jpg")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "membership/series/beyond-the-blade")
}

case object TheSnap extends ArticleEmailMetadata {
  val name = "The Snap"
  override val banner = Some("the-snap.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "politics/series/the-snap")
}

case object TheFlyer extends FrontEmailMetadata {
  val name = "The Flyer"
  override val banner = Some("the-flyer.png")
}

case object Opinion extends FrontEmailMetadata {
  val name = "Opinion"
  override val banner = Some("opinion.png")
}

case object TheGuardianTodayUS extends FrontEmailMetadata {
  val name = "The Guardian Today US"
  override val banner = Some("the-guardian-today-us.png")
}

case object SleeveNotes extends FrontEmailMetadata {
  val name = "Sleeve Notes"
  override val banner = Some("sleeve-notes.png")
}

case object BusinessToday extends FrontEmailMetadata {
  val name = "Business Today"
  override val banner = Some("business-today.png")
}

case object TheRecap extends FrontEmailMetadata {
  val name = "The Recap"
  override val banner = Some("the-recap.png")
}

object EmailAddons {
  private val defaultAddress = "Kings Place, 90 York Way, London, N1 9GU. Registered in England No. 908396"
  private val defaultBanner = "generic.png"
  private val articleEmails     = Seq(
    ArtWeekly,
    DocumentariesUpdate,
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
    EuReferendum,
    LabNotes,
    OlympicsDailyBriefing,
    HandwrittenMediaBriefing,
    VaginaDispatches,
    KeepItInTheGround,
    TheWeekInPatriarchy,
    OutsideInAmerica,
    TheResistanceNow,
    BeyondTheBlade,
    TheSnap)
  private val frontEmails = Seq(
    TheFlyer,
    CuratedMediaBriefing,
    Opinion,
    TheGuardianTodayUS,
    SleeveNotes,
    BusinessToday,
    TheRecap
  )

  implicit class EmailContentType(p: Page) {
    val email = p match {
      case c: ContentPage => articleEmails.find(_.test(c))
      case p: PressedPage => frontEmails.find(_.test(p))
    }

    val fallbackSeriesText = PartialFunction.condOpt(p) {
      case c: ContentPage if email.isEmpty => c.item.content.seriesName
    }

    lazy val banner = {
      val banner = email flatMap (_.banner) getOrElse defaultBanner
      Static(s"images/email/banners/$banner")
    }

    lazy val address = email flatMap (_.address) getOrElse defaultAddress

    lazy val bodyClass = email map (_.name.toLowerCase().replace(' ', '-'))
  }
}
