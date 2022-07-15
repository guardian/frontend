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

case object MoneyTalks extends ArticleEmailMetadata {
  val name = "Money Talks"
  override val banner = Some("money-talks.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "money/series/money-talks")
}

case object TheBreakdown extends ArticleEmailMetadata {
  val name = "The Breakdown"
  override val banner = Some("the-breakdown.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "sport/series/breakdown")
}

case object WorldCupFiver extends ArticleEmailMetadata {
  val name = "World Cup Fiver"
  override val banner = Some("world-cup-fiver.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "football/series/world-cup-fiver")
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

case object FirstEdition extends ArticleEmailMetadata {
  val name = "First Edition"
  override val banner = Some("first-edition.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "world/series/first-edition")
}

case object FightToVote extends ArticleEmailMetadata {
  val name = "Fight to vote"
  override val banner = Some("fight-to-vote.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "us-news/series/the-campaign-minute-2016")
}

case object EuReferendum extends ArticleEmailMetadata {
  val name = "Brexit Briefing"
  override val banner = Some("brexit-briefing.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "politics/series/eu-referendum-morning-briefing")
}

case object LabNotes extends ArticleEmailMetadata {
  val name = "Lab Notes"
  override val banner = Some("lab-notes.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "science/series/lab-notes")
}

case object HandwrittenMediaBriefing extends ArticleEmailMetadata {
  val name = "Media Briefing"
  override val banner = Some("media-briefing.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "media/series/mediaguardian-briefing")
}

case object TheUpsideWeeklyReport extends ArticleEmailMetadata {
  val name = "The Upside Weekly Report"
  override val banner = Some("the-upside.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "world/series/the-upside-weekly-report")
}

case object LabNotesFront extends FrontEmailMetadata {
  val name = "Lab Notes"
  override val banner = Some("lab-notes.png")
}

case object CuratedMediaBriefing extends FrontEmailMetadata {
  val name = "Media Briefing"
  override val banner = Some("media-briefing.png")
}

case object TheWeekInPatriarchy extends ArticleEmailMetadata {
  val name = "The Week In Patriarchy"
  override val banner = Some("the-week-in-patriarchy.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "commentisfree/series/the-week-in-patriarchy")
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
  override val banner = Some("beyond-the-blade.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "membership/series/beyond-the-blade")
}

case object MorningMail extends ArticleEmailMetadata {
  val name = "Morning Mail"
  override val banner = Some("morning-mail.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "australia-news/series/guardian-australia-s-morning-mail")
}

case object VirtualRealityStudio extends ArticleEmailMetadata {
  val name = "Virtual Reality Studio"
  override val banner = Some("virtual-reality-studio.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "news/series/virtual-reality-studio")
}

case object WeekendReading extends ArticleEmailMetadata {
  val name = "Weekend Reading"
  override val banner = Some("weekend-reading.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "membership/series/weekend-reading")
}

case object TheNewArrivals extends ArticleEmailMetadata {
  val name = "The New Arrivals"
  override val banner = Some("the-new-arrivals.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "world/series/the-new-arrivals-email-update")
}

case object FashionWeek extends ArticleEmailMetadata {
  val name = "Fashion Week"
  override val banner = Some("fashion-week.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "fashion/series/fashion-week--image-of-the-day")
}

case object CrosswordEditorsUpdate extends ArticleEmailMetadata {
  val name = "Crossword Editor's Update"
  override val banner = Some("crosswords-editors-update.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "crosswords/series/crossword-editor-update")
}

case object HearHere extends ArticleEmailMetadata {
  val name = "Hear Here"
  override val banner = Some("hear-here.gif")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "tv-and-radio/series/hear-here")
}

case object AnimalsFarmed extends ArticleEmailMetadata {
  val name = "Animals Farmed"
  override val banner = Some("animals-farmed-update.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "animals-farmed/series/animals-farmed-update")
}

case object USMorningBriefing extends ArticleEmailMetadata {
  val name = "First Thing: the US morning briefing"
  override val banner = Some("first-thing-2.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "us-news/series/guardian-us-briefing")
}

case object ObserverPictureArchive extends ArticleEmailMetadata {
  val name = "Observer Picture Archive"
  override val banner = Some("observer-picture-archive.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "theobserver/series/observer-picture-archive")
}

case object GunsAndLiesInAmerica extends ArticleEmailMetadata {
  val name = "Guns And Lies In America"
  override val banner = Some("guns_and_lies.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "us-news/series/guns-and-lies-in-america-newsletter")
}

case object TheSnap extends ArticleEmailMetadata {
  val name = "The Snap"
  override val banner = Some("the-snap.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "politics/series/the-snap")
}

case object AndrewSparrowsElectionBriefing extends ArticleEmailMetadata {
  val name = "Andrew Sparrow's Election Briefing"
  override val banner = Some("andrew-sparrow-email.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "politics/series/andrew-sparrows-election-briefing")
}

case object CoronavirusTheWeekExplained extends ArticleEmailMetadata {
  val name = "Coronavirus: the week explained"
  override val banner = Some("coronavirus.png")
  def test(c: ContentPage): Boolean = c.item.tags.series.exists(_.id == "world/series/coronavirus-the-week-explained")
}

case object CoronavirusAustraliaAtAGlance extends ArticleEmailMetadata {
  val name = "Coronavirus: Australia at a glance"
  override val banner = Some("banner-coronavirus-aus.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "australia-news/series/coronavirus-australia-latest-at-a-glance")
}

case object CoronavirusinThePacific extends ArticleEmailMetadata {
  val name = "Coronavirus in the Pacific"
  override val banner = Some("coronavirus-in-the-pacific.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "world/series/coronavirus-in-the-pacific-weekly-briefing")
}

case object USElectionBriefingForAustralia extends ArticleEmailMetadata {
  val name = "US election briefing for Australia"
  override val banner = Some("us-election-briefing-australia.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "australia-news/series/us-election-2020-briefing-australia")
}

case object TechScape extends ArticleEmailMetadata {
  val name = "TechScape"
  override val banner = Some("techscape.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "technology/series/techscape")
}

case object Tokyo2020DailyBriefing extends ArticleEmailMetadata {
  val name = "Tokyo2020DailyBriefing"
  override val banner = Some("tokyo2020-daily-briefing.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "sport/series/tokyo-2020-daily-briefing")
}

case object Beijing2022DailyBriefing extends ArticleEmailMetadata {
  val name = "Beijing 2022 daily briefing"
  override val banner = Some("winter-olympics-2022.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "sport/series/beijing-2022-daily-briefing")
}

case object TheFlyer extends FrontEmailMetadata {
  val name = "The Flyer"
  override val banner = Some("the-flyer.png")
}

case object Opinion extends FrontEmailMetadata {
  val name = "The Best of Guardian Opinion"
  override val banner = Some("opinion.png")
}

case object TheGuardianTodayUS extends FrontEmailMetadata {
  val name = "The Guardian Today US"
  override val banner = Some("the-guardian-headlines-us.png")
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

case object GlobalDispatch extends FrontEmailMetadata {
  val name = "Global Dispatch"
  override val banner = Some("global-dispatch.png")
}

case object Bookmarks extends FrontEmailMetadata {
  val name = "Bookmarks"
  override val banner = Some("bookmarks.png")
}

case object TheLongRead extends FrontEmailMetadata {
  val name = "The Long Read"
  override val banner = Some("the-long-read.png")
}

case object FashionStatement extends FrontEmailMetadata {
  val name = "Fashion Statement"
  override val banner = Some("fashion-statement.png")
}

case object TheGuardianB2b extends FrontEmailMetadata {
  val name = "The Guardian B2b"
  override val banner = Some("business-view.png")
}

case object BusinessView extends FrontEmailMetadata {
  val name = "Business View"
  override val banner = Some("business-view.png")
}

case object OpinionUs extends FrontEmailMetadata {
  val name = "The Best of Guardian Opinion US"
  override val banner = Some("opinion.png")
}

case object ThisLandIsYourLand extends FrontEmailMetadata {
  val name = "This Land Is Your Land"
  override val banner = Some("this-land-is.png")
}

case object WinterOlympics2018 extends FrontEmailMetadata {
  val name = "Winter Olympics 2018"
  override val banner = Some("winter-olympics-2018.png")
}

case object ThisIsEurope extends FrontEmailMetadata {
  val name = "This Is Europe"
  override val banner = Some("this-is-europe-series.png")
}

case object TeacherNetwork extends FrontEmailMetadata {
  val name = "Teacher Network"
  override val banner = Some("teacher-network.png")
}

case object SocialCareNetwork extends FrontEmailMetadata {
  val name = "Social Care Network"
  override val banner = Some("social-care-network.png")
}

case object GuardianStudents extends FrontEmailMetadata {
  val name = "Guardian Students"
  override val banner = Some("guardian-students.png")
}

case object HealthcareProfessionalsNetwork extends FrontEmailMetadata {
  val name = "Healthcare Professionals Network"
  override val banner = Some("healthcare-professionals-network.png")
}

case object GuardianUniversities extends FrontEmailMetadata {
  val name = "Guardian Universities"
  override val banner = Some("universities.png")
}

case object PublicLeadersNetwork extends FrontEmailMetadata {
  val name = "Public Leaders Network"
  override val banner = Some("public-leaders-network.png")
}

case object HousingNetwork extends FrontEmailMetadata {
  val name = "Housing Network"
  override val banner = Some("housing-network.png")
}

case object VoluntarySectorNetwork extends FrontEmailMetadata {
  val name = "Voluntary Sector Network"
  override val banner = Some("voluntary-sector-network.png")
}

case object TheCityscape extends FrontEmailMetadata {
  val name = "The Cityscape"
  override val banner = Some("the-cityscape.png")
}

case object SocietyWeekly extends FrontEmailMetadata {
  val name = "Society Weekly"
  override val banner = Some("society-weekly.png")
}

case object TheGuardianTodayUK extends FrontEmailMetadata {
  val name = "The Guardian Today"
  override val banner = Some("the-guardian-headlines-uk.png")
}

case object TheGuardianTodayAustralia extends FrontEmailMetadata {
  val name = "The Guardian Today Australia"
  override val banner = Some("the-guardian-headlines-australia.png")
}

case object FilmToday extends FrontEmailMetadata {
  val name = "Film Today"
  override val banner = Some("film-today.png")
}

case object OpinionAus extends FrontEmailMetadata {
  val name = "The Best of Guardian Opinion Australia"
  override val banner = Some("opinion.png")
}

case object PoliticsAu extends FrontEmailMetadata {
  val name = "Australian Politics"
  override val banner = Some("australian-politics.png")
}

case object SportAu extends FrontEmailMetadata {
  val name = "Guardian Australia Sport"
  override val banner = Some("australia-sports.png")
}

case object FirstDogOnTheMoon extends FrontEmailMetadata {
  val name = "First Dog On The Moon"
  override val banner = Some("first-dog-on-the-moon.png")
}

case object GreenLight extends FrontEmailMetadata {
  val name = "Green Light"
  override val banner = Some("green-light.png")
}

case object WordOfMouth extends FrontEmailMetadata {
  val name = "Word Of Mouth"
  override val banner = Some("word-of-mouth.png")
}

case object SavedForLater extends FrontEmailMetadata {
  val name = "Saved For Later"
  override val banner = Some("saved-for-later.png")
}

case object TheGuide extends ArticleEmailMetadata {
  val name = "The Guide"
  override val banner = Some("the-guide.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "culture/series/the-guide")
}

case object DesignReview extends FrontEmailMetadata {
  val name = "Design review"
  override val banner = Some("design-review.png")
}

case object Documentaries extends FrontEmailMetadata {
  val name = "Documentaries"
  override val banner = Some("documentaries.gif")
}

case object TheRuralNetwork extends FrontEmailMetadata {
  val name = "The Rural Network"
  override val banner = Some("rural-network.png")
}

case object AustraliasModernOutback extends FrontEmailMetadata {
  val name = "Australia Modern Outback"
  override val banner = Some("aus-modern-outback.png")
}

case object FiveGreatReads extends ArticleEmailMetadata {
  val name = "Five Great Reads"
  override val banner = Some("five-great-reads.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "australia-news/series/five-great-reads")
}

case object MovingTheGoalposts extends ArticleEmailMetadata {
  val name = "Moving the Goalposts"
  override val banner = Some("moving-the-goalposts-euro-2022.png")
  def test(c: ContentPage): Boolean =
    c.item.tags.series.exists(_.id == "football/series/moving-the-goalposts")
}

object EmailAddons {
  val unsubscribePlaceholder = "%%unsub_center_url%%"

  private val defaultAddress = "Kings Place, 90 York Way, London, N1 9GU. Registered in England No. 908396"
  private val defaultBanner = "generic.png"
  private val articleEmails = Seq(
    ArtWeekly,
    MoneyTalks,
    TheBreakdown,
    WorldCupFiver,
    TheFiver,
    TheSpin,
    FirstEdition,
    FightToVote,
    EuReferendum,
    LabNotes,
    HandwrittenMediaBriefing,
    TheWeekInPatriarchy,
    OutsideInAmerica,
    TheResistanceNow,
    BeyondTheBlade,
    MorningMail,
    VirtualRealityStudio,
    WeekendReading,
    TheNewArrivals,
    FashionWeek,
    HearHere,
    CrosswordEditorsUpdate,
    TheUpsideWeeklyReport,
    AnimalsFarmed,
    USMorningBriefing,
    ObserverPictureArchive,
    GunsAndLiesInAmerica,
    TheSnap,
    AndrewSparrowsElectionBriefing,
    CoronavirusTheWeekExplained,
    CoronavirusAustraliaAtAGlance,
    CoronavirusinThePacific,
    USElectionBriefingForAustralia,
    TechScape,
    Tokyo2020DailyBriefing,
    TheGuide,
    FiveGreatReads,
    Beijing2022DailyBriefing,
    MovingTheGoalposts,
  )
  private val frontEmails = Seq(
    SocialCareNetwork,
    GuardianUniversities,
    GuardianStudents,
    HealthcareProfessionalsNetwork,
    PublicLeadersNetwork,
    VoluntarySectorNetwork,
    HousingNetwork,
    TheFlyer,
    LabNotesFront,
    CuratedMediaBriefing,
    Opinion,
    TheGuardianTodayUS,
    SleeveNotes,
    BusinessToday,
    TheRecap,
    GlobalDispatch,
    Bookmarks,
    TheLongRead,
    FashionStatement,
    BusinessView,
    TheGuardianB2b,
    OpinionUs,
    ThisLandIsYourLand,
    WinterOlympics2018,
    ThisIsEurope,
    TeacherNetwork,
    TheCityscape,
    SocietyWeekly,
    TheGuardianTodayUK,
    TheGuardianTodayAustralia,
    FilmToday,
    OpinionAus,
    PoliticsAu,
    SportAu,
    FirstDogOnTheMoon,
    GreenLight,
    WordOfMouth,
    SavedForLater,
    TheRuralNetwork,
    DesignReview,
    Documentaries,
    AustraliasModernOutback,
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

    lazy val analyticsComponentId = email map (_.name.toLowerCase().replace(' ', '_')) getOrElse "article"
  }
}
