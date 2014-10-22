package model

import common.`package`._

case class ShareLink(
  text: String,
  css: String,
  userMessage: String,
  href: String
)

trait ShareLinks { self: Content =>

  private def shareLink(shareType: String, blockId: Option[String]): Option[ShareLink] = {

    def shareCampaignUrl(campaign: String, blockId: Option[String]) = {
      blockId.map { block => s"$shortUrl/$campaign#$block" } getOrElse s"$shortUrl/$campaign"
    }

    lazy val facebook = shareCampaignUrl("sfb", blockId).urlEncoded
    lazy val googlePlus = shareCampaignUrl("sgp", blockId).urlEncoded
    lazy val link = shareCampaignUrl("sbl", blockId)
    lazy val twitter = shareCampaignUrl("stw", blockId).urlEncoded

    shareType match {
      case "facebook" => Some(ShareLink("Facebook", "facebook", "Share on Facebook", s"https://www.facebook.com/sharer/sharer.php?u=$facebook&ref=responsive"))
      case "twitter"  => Some(ShareLink("Twitter", "twitter", "Share on Twitter", s"https://twitter.com/intent/tweet?text=${webTitle.urlEncoded}&url=$twitter"))
      case "gplus"    => Some(ShareLink("Google plus", "gplus", "Share on Google+", s"https://plus.google.com/share?url=$googlePlus&amp;hl=en-GB&amp;wwc=1"))
      case "email"    => Some(ShareLink("Email", "email", "Share via Email", s"mailto:?subject=${webTitle.urlEncoded}&amp;body=${link.urlEncoded}"))
      case "link"     => Some(ShareLink("Link", "link", "Copy and Paste", link))
      case _ => None
    }
  }

  def blockLevelShares(blockId: String): Seq[ShareLink] = List("facebook", "twitter", "gplus").flatMap(shareLink(_, Some(blockId)))

  def blockLevelLink(blockId: String): Option[ShareLink] = shareLink("link", Some(blockId))

  lazy val pageShares: Seq[ShareLink] = List("email", "facebook", "twitter", "gplus").flatMap(shareLink(_, None))
}