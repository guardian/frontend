package model

import conf.Static
import layout.FaciaContainer
import java.security.MessageDigest
import java.math.BigInteger
import scala.util.control.NonFatal


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

  private val digest = MessageDigest.getInstance("MD5")

  private def md5(input: String): Option[String] = {
    try {
      digest.update(input.getBytes(), 0, input.length)

      Option(new BigInteger(1, digest.digest()).toString(16))
    } catch {
      case NonFatal(_) => None
    }
  }
}

object Badges {
  val newArrivals = Badge("world/series/the-new-arrivals", Static("images/badges/new-arrivals.png"), Some("new-arrivals"))
  val brexitGamble = Badge("uk-news/series/the-brexit-gamble", Static("images/badges/EUReferendumBadge.svg"))
  val roadToTheVote = Badge("politics/series/road-to-the-vote", Static("images/badges/EUReferendumBadge.svg"))
  val brexitFrontline = Badge("politics/series/brexit-frontline", Static("images/badges/EUReferendumBadge.svg"))
  val brexitDividedGenerations = Badge("politics/series/brexit-divided-generations", Static("images/badges/EUReferendumBadge.svg"))
  val brexitHowItCameToThis = Badge("politics/series/brexit-how-it-came-to-this", Static("images/badges/EUReferendumBadge.svg"))
  val londonVersus = Badge("uk-news/series/london-versus", Static("images/badges/london-versus.svg"))
  val beyondTheBlade = Badge("membership/series/beyond-the-blade", Static("images/badges/beyondthebladebadge.svg"))
  val euElection = Badge("politics/2019-european-parliamentary-elections", Static("images/badges/eu_election.svg"))
  val paradisePapers = Badge("news/series/paradise-papers", Static("images/badges/pp_web.svg"))
  val cambridgeAnalytica = Badge("news/series/cambridge-analytica-files", Static("images/badges/calock.svg"))
  val specialReport = SpecialBadge("06966783c5b5413394df723f2ca58030953", "feb78187bd4de427603a164d0a69f19f", Static("images/badges/56738_Badge.svg"))
  val nhs70 = Badge("society/series/nhs-at-70", Static("images/badges/nhs-70.svg"))
  val cricketWorldCup = Badge("sport/cricket-world-cup-2019", Static("images/badges/cricket-world-cup.svg"))
  val womensWorldCup = Badge("football/womens-world-cup-2019", Static("images/badges/womens-world-cup.svg"))
  val greenBlood = Badge("environment/series/green-blood", Static("images/badges/green-blood.svg"))
  val usElections2020 = Badge("us-news/us-elections-2020", Static("images/badges/us-elections-2020.svg"))
  val ausElection = Badge("australia-news/australian-election-2019", Static("images/badges/australian-election-2019.svg"))
  val midterm = Badge("us-news/us-midterm-elections-2018", Static("images/badges/midterm.svg"))
  val theNewPopulism = Badge("world/series/the-new-populism", Static("images/badges/the-new-populism.svg"))
  val theImplantFiles = Badge("society/series/the-implant-files", Static("images/badges/the-implant-files.svg"))
  val theRealBorisJohnson = Badge("politics/series/the-real-boris-johnson ", Static("images/badges/the-real-boris-johnson.svg"))
  val johnsonsPromises = Badge("uk-news/series/johnsons-promises", Static("images/badges/johnsons-promises.svg"))
  val rugbyWorldCup = Badge("sport/rugby-world-cup-2019", Static("images/badges/rugby-world-cup.svg"))
  val behindTheLines = Badge("uk-news/series/behind-the-lines", Static("images/badges/behind-the-lines.svg"))
  val theEmptyDoorway = Badge("cities/series/the-empty-doorway", Static("images/badges/the-empty-doorway.svg"))
  val yemenAtWar = Badge("world/series/yemen-at-war", Static("images/badges/yemen-at-war.svg"))
  val thePolluters = Badge("environment/series/the-polluters", Static("images/badges/the-polluters.svg"))
  val youthJustice = Badge("society/youthjustice", Static("images/badges/childrenInTheDocks-Icon1.svg"))
  val ukElection2019 = Badge("politics/general-election-2019", Static("images/badges/ge2019-badge.svg"))
  val lostInPolitics = Badge("politics/series/lost-in-politics", Static("images/badges/lost-in-politics-badge.svg"))
  val thisIsEurope = Badge("world/series/this-is-europe", Static("images/badges/this-is-europe.svg"))
  val coronavirus = Badge("world/series/coronavirus-100-days-that-changed-the-world", Static("images/badges/corona-badge.svg"))

  val allBadges = Seq(newArrivals, brexitGamble, roadToTheVote, brexitFrontline, brexitDividedGenerations,
    brexitHowItCameToThis, londonVersus, beyondTheBlade, euElection, paradisePapers, cambridgeAnalytica, specialReport,
    nhs70, cricketWorldCup, womensWorldCup, greenBlood, usElections2020, ausElection, midterm, theNewPopulism,
    theImplantFiles, theRealBorisJohnson, johnsonsPromises, rugbyWorldCup, behindTheLines, theEmptyDoorway, yemenAtWar,
    thePolluters, youthJustice, ukElection2019, lostInPolitics, thisIsEurope, coronavirus)

  def badgeFor(c: ContentType): Option[Badge] = {
    badgeForTags(c.tags.tags.map(_.id))
  }

  def badgeForTags(tags: Traversable[String]): Option[Badge] = {

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
