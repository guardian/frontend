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
case class SpecialBadge(salt: String, hashedTag: String) extends BaseBadge {
  def maybeThisBadge(tag: String): Option[Badge] =
    if (md5(salt + tag).contains(hashedTag)) {
      Some(Badge(tag, s"https://assets.guim.co.uk/special/$tag/special-badge.svg"))
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
  val generalElection2017 = Badge("politics/general-election-2017", Static("images/badges/GE2017Badge.svg"))
  val facebookFiles = Badge("news/series/facebook-files", Static("images/badges/facebookFiles.svg"))

  val allBadges = Seq(newArrivals, brexitGamble, beyondTheBlade, generalElection2017, facebookFiles)

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
