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
  val beyondTheBlade = Badge("membership/series/beyond-the-blade", Static("images/badges/beyondthebladebadge.svg"))
  val britainsDebt = Badge("business/series/britains-debt-timebomb", Static("images/badges/uk-debt.svg"))
  val paradisePapers = Badge("news/series/paradise-papers", Static("images/badges/pp_web.svg"))
  val cambridgeAnalytica = Badge("news/series/cambridge-analytica-files", Static("images/badges/calock.svg"))
  val specialReport = SpecialBadge("06966783c5b5413394df723f2ca58030953", "feb78187bd4de427603a164d0a69f19f", Static("images/badges/56738_Badge.svg"))
  val worldCup2018 = Badge("football/world-cup-2018", Static("images/badges/world-cup-2018.svg"))
  val nhs70 = Badge("society/series/nhs-at-70", Static("images/badges/nhs-70.svg"))
  val midterm = Badge("us-news/us-midterm-elections-2018", Static("images/badges/midterm.svg"))
  val theAgeOfExtinction = Badge("environment/series/the-age-of-extinction", Static("images/badges/the-age-of-extinction.svg"))

  val allBadges = Seq(newArrivals, brexitGamble, beyondTheBlade, britainsDebt, paradisePapers, cambridgeAnalytica, specialReport, worldCup2018, nhs70, midterm, theAgeOfExtinction)

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
