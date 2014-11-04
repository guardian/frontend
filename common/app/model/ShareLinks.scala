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
    lazy val whatsapp = shareCampaignUrl("swa", blockId)
    lazy val webTitleAsciiEncoding = webTitle.encodeURIComponent

    shareType match {
      case "facebook" => Some(ShareLink("Facebook", "facebook", "Share on Facebook", s"https://www.facebook.com/sharer/sharer.php?u=$facebook&ref=responsive"))
      case "twitter"  => Some(ShareLink("Twitter", "twitter", "Share on Twitter", s"https://twitter.com/intent/tweet?text=${webTitle.urlEncoded}&url=$twitter"))
      case "gplus"    => Some(ShareLink("Google plus", "gplus", "Share on Google+", s"https://plus.google.com/share?url=$googlePlus&amp;hl=en-GB&amp;wwc=1"))
      case "whatsapp" => Some(ShareLink("WhatsApp", "whatsapp", "Share on WhatsApp", s"""whatsapp://send?text=${("\"" + webTitle + "\" " + whatsapp).encodeURIComponent}"""))
      case "email"    => Some(ShareLink("Email", "email", "Share via Email", s"mailto:?subject=$webTitleAsciiEncoding&body=${link.urlEncoded}"))
      case "linkedin"  => Some(ShareLink("LinkedIn", "linkedin", "Share on LinkedIn", s"http://www.linkedin.com/shareArticle?mini=true&title=${webTitle.urlEncoded}&url=${webUrl.urlEncoded}"))
      case "pinterestPage"  => Some(ShareLink("Pinterest", "pinterest", "Share on Pinterest", s"http://www.pinterest.com/pin/find/?url=${webUrl.urlEncoded}"))
      case "pinterestBlock"  => Some(ShareLink("Pinterest", "pinterest", "Share on Pinterest", s"http://www.pinterest.com/pin/create/button/?description=${webTitle.urlEncoded}&url=${webUrl.urlEncoded}"))
      case "link"     => Some(ShareLink("Link", "link", "Copy and Paste", link))
      case _ => None
    }
  }

  protected lazy val blockShareOrder = List("facebook", "twitter", "gplus")
  protected lazy val pageShareOrder = List("facebook", "twitter", "email", "linkedin", "gplus", "whatsapp")

  def blockLevelShares(blockId: String): Seq[ShareLink] = blockShareOrder.flatMap(shareLink(_, Some(blockId)))
  def blockLevelLink(blockId: String): Option[ShareLink] = shareLink("link", Some(blockId))

  lazy val pageShares: Seq[ShareLink] = pageShareOrder.flatMap(shareLink(_, None))
}