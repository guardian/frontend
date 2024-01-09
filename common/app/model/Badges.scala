package model

import conf.Static
import layout.FaciaContainer
import org.apache.commons.codec.digest.DigestUtils

trait BaseBadge {
  def maybeThisBadge(tag: String): Option[Badge]
}

case class Badge(seriesTag: String, imageUrl: String, classModifier: Option[String] = None) extends BaseBadge {
  def maybeThisBadge(tag: String): Option[Badge] = if (seriesTag == tag) Some(this) else None
}

// for salt use a random unique string - e.g. some string from running in terminal: pwgen -n -y 20
// it's fine to commit that, it just stops people using previously calculated tables to reverse the hash
case class SpecialBadge(salt: String, hashedTag: String, imageUrl: String) extends BaseBadge {
  def maybeThisBadge(tag: String): Option[Badge] =
    if (md5(salt + tag).contains(hashedTag)) {
      Some(Badge(tag, imageUrl))
    } else None

  private def md5(input: String): Option[String] = {
    Some(DigestUtils.md5Hex(input))
  }
}

object Badges {
  val newArrivals: Badge =
    Badge("world/series/the-new-arrivals", Static("images/badges/new-arrivals.png"), Some("new-arrivals"))
  val brexitGamble: Badge = Badge("uk-news/series/the-brexit-gamble", Static("images/badges/EUReferendumBadge.svg"))
  val roadToTheVote: Badge = Badge("politics/series/road-to-the-vote", Static("images/badges/EUReferendumBadge.svg"))
  val brexitFrontline: Badge = Badge("politics/series/brexit-frontline", Static("images/badges/EUReferendumBadge.svg"))
  val brexitDividedGenerations: Badge =
    Badge("politics/series/brexit-divided-generations", Static("images/badges/EUReferendumBadge.svg"))
  val brexitHowItCameToThis: Badge =
    Badge("politics/series/brexit-how-it-came-to-this", Static("images/badges/EUReferendumBadge.svg"))
  val londonVersus: Badge = Badge("uk-news/series/london-versus", Static("images/badges/london-versus.svg"))
  val beyondTheBlade: Badge =
    Badge("membership/series/beyond-the-blade", Static("images/badges/beyondthebladebadge.svg"))
  val euElection: Badge =
    Badge("politics/2019-european-parliamentary-elections", Static("images/badges/eu_election.svg"))
  val paradisePapers: Badge = Badge("news/series/paradise-papers", Static("images/badges/pp_web.svg"))
  val cambridgeAnalytica: Badge = Badge("news/series/cambridge-analytica-files", Static("images/badges/calock.svg"))
  val pegasusProject: Badge = Badge("news/series/pegasus-project", Static("images/badges/SpecialReportJul21.svg"))
  val suisseSecretsProject: Badge = Badge("news/series/suisse-secrets", Static("images/badges/18_feb_2022_Badge.svg"))
  val specialReport: SpecialBadge = SpecialBadge(
    "06966783c5b5413394df723f2ca58030953",
    "feb78187bd4de427603a164d0a69f19f",
    Static("images/badges/56738_Badge.svg"),
  )
  val specialReport2: SpecialBadge = SpecialBadge(
    "a-public-salt3W#ywHav!p+?r+W2$E6=",
    "0d18e8413ab7cdf377e1202d24452e63",
    Static("images/badges/05_july_2022_Badge.svg"),
  )
  val pandoraPapers: Badge = Badge("news/series/pandora-papers", Static("images/badges/SpecialReportSep21.svg"))
  val nhs70: Badge = Badge("society/series/nhs-at-70", Static("images/badges/nhs-70.svg"))
  val cricketWorldCup: Badge = Badge("sport/cricket-world-cup-2019", Static("images/badges/cricket-world-cup.svg"))
  val womensWorldCup: Badge = Badge("football/womens-world-cup-2019", Static("images/badges/womens-world-cup.svg"))
  val greenBlood: Badge = Badge("environment/series/green-blood", Static("images/badges/green-blood.svg"))
  val ausElection: Badge =
    Badge("australia-news/australian-election-2019", Static("images/badges/australian-election-2019.svg"))
  val midterm: Badge = Badge("us-news/us-midterm-elections-2018", Static("images/badges/midterm.svg"))
  val theNewPopulism: Badge = Badge("world/series/the-new-populism", Static("images/badges/the-new-populism.svg"))
  val theImplantFiles: Badge = Badge("society/series/the-implant-files", Static("images/badges/the-implant-files.svg"))
  val theRealBorisJohnson: Badge =
    Badge("politics/series/the-real-boris-johnson ", Static("images/badges/the-real-boris-johnson.svg"))
  val johnsonsPromises: Badge = Badge("uk-news/series/johnsons-promises", Static("images/badges/johnsons-promises.svg"))
  val rugbyWorldCup: Badge = Badge("sport/rugby-world-cup-2019", Static("images/badges/rugby-world-cup.svg"))
  val behindTheLines: Badge = Badge("uk-news/series/behind-the-lines", Static("images/badges/behind-the-lines.svg"))
  val theEmptyDoorway: Badge = Badge("cities/series/the-empty-doorway", Static("images/badges/the-empty-doorway.svg"))
  val yemenAtWar: Badge = Badge("world/series/yemen-at-war", Static("images/badges/yemen-at-war.svg"))
  val thePolluters: Badge = Badge("environment/series/the-polluters", Static("images/badges/the-polluters.svg"))
  val lostInPolitics: Badge =
    Badge("politics/series/lost-in-politics", Static("images/badges/lost-in-politics-badge.svg"))
  val thisIsEurope: Badge = Badge("world/series/this-is-europe", Static("images/badges/this-is-europe.svg"))
  val coronavirus: Badge =
    Badge("world/series/coronavirus-100-days-that-changed-the-world", Static("images/badges/corona-badge.svg"))
  val auGreenRecovery: Badge =
    Badge("australia-news/series/the-green-recovery", Static("images/badges/green-recovery.svg"))
  val greenRecovery: Badge = Badge("environment/series/the-green-recovery", Static("images/badges/green-recovery.svg"))
  val culturePeril: Badge = Badge("culture/series/culture-in-peril", Static("images/badges/culture-badge.svg"))
  val oneHundredDays: Badge = Badge("us-news/series/climate-countdown", Static("images/badges/100days.svg"))
  val futureofcities: Badge = Badge("society/futureofcities", Static("images/badges/futureofcities.svg"))
  val theFightForHongKong: Badge = Badge("world/series/the-fight-for-hong-kong", Static("images/badges/eohk.svg"))
  val spyCopsScandal: Badge = Badge("uk-news/series/spy-cops-scandal", Static("images/badges/spy-cops-scandal.svg"))
  val theLastChance: Badge = Badge("environment/series/the-last-chance", Static("images/badges/the-last-chance.svg"))
  val dreamsInterrupted: Badge =
    Badge("australia-news/series/dreams-interrupted", Static("images/badges/dreams-interrupted.svg"))
  val anniversary200: Badge =
    Badge("media/series/guardian-200", Static("images/badges/anniversary200.svg"))
  val euro2020: Badge =
    Badge("football/euro-2020", Static("images/badges/euro-2020.svg"))
  val tokyo2020: Badge =
    Badge("sport/olympic-games-2020", Static("images/badges/tokyo-2020.svg"))
  val paralympics2020: Badge =
    Badge("sport/paralympic-games-2020", Static("images/badges/tokyo-2020.svg"))
  val tokyoparalympics2020: Badge =
    Badge("sport/tokyo-paralympic-games-2020", Static("images/badges/tokyo-2020.svg"))
  val cop26: Badge =
    Badge("environment/cop26-glasgow-climate-change-conference-2021", Static("images/badges/cop26-badge.svg"))
  val winterOlympics2022: Badge =
    Badge("sport/winter-olympics-2022", Static("images/badges/winter-olympics-2022-badge.svg"))
  val ausElection2022: Badge =
    Badge("australia-news/australian-election-2022", Static("images/badges/australian-election-2022.svg"))
  val newsletters: Badge =
    Badge("tone/newsletter-tone", Static("images/badges/newsletter-badge.svg"))
  val womenseuros2022: Badge =
    Badge("football/women-s-euro-2022", Static("images/badges/womens_euros_2022_badge.svg"))
  val usMidtermElections2022: Badge =
    Badge("us-news/us-midterm-elections-2022", Static("images/badges/us-midterm-elections-2022.svg"))
  val worldCup2022: Badge =
    Badge("football/world-cup-2022", Static("images/badges/world-cup-2022.svg"))

  val allBadges: Seq[BaseBadge] = Seq(
    newArrivals,
    brexitGamble,
    roadToTheVote,
    brexitFrontline,
    brexitDividedGenerations,
    brexitHowItCameToThis,
    londonVersus,
    beyondTheBlade,
    euElection,
    paradisePapers,
    cambridgeAnalytica,
    pegasusProject,
    suisseSecretsProject,
    specialReport,
    pandoraPapers,
    nhs70,
    cricketWorldCup,
    womensWorldCup,
    greenBlood,
    ausElection,
    midterm,
    theNewPopulism,
    theImplantFiles,
    theRealBorisJohnson,
    johnsonsPromises,
    rugbyWorldCup,
    behindTheLines,
    theEmptyDoorway,
    yemenAtWar,
    thePolluters,
    lostInPolitics,
    thisIsEurope,
    coronavirus,
    auGreenRecovery,
    greenRecovery,
    culturePeril,
    oneHundredDays,
    futureofcities,
    theFightForHongKong,
    spyCopsScandal,
    theLastChance,
    dreamsInterrupted,
    anniversary200,
    euro2020,
    tokyo2020,
    paralympics2020,
    tokyoparalympics2020,
    cop26,
    winterOlympics2022,
    specialReport2,
    ausElection2022,
    newsletters,
    womenseuros2022,
    usMidtermElections2022,
    worldCup2022,
  )

  def badgeFor(c: ContentType): Option[Badge] = {
    badgeForTags(c.tags.tags.map(_.id))
  }

  def badgeForTags(tags: Iterable[String]): Option[Badge] = {

    val badgesForTags =
      for {
        tagId <- tags
        baseBadge <- allBadges
        maybeBadge <- baseBadge.maybeThisBadge(tagId)
      } yield maybeBadge
    badgesForTags.headOption
  }

  def badgeFor(fc: FaciaContainer): Option[Badge] = badgeForTags(fc.href)

}
