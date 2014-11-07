package model

import common.`package`._

case class ShareLink (
  text: String,
  css: String,
  userMessage: String,
  href: String
)

trait ShareLinks {

  def blockShortUrl: String
  def blockWebUrl: String
  def blockWebTitle: String

  private def shareLink(shareType: String, elementId: Option[String] = None, mediaPath: Option[String] = None, linkUrl: String, title: String): Option[ShareLink] = {

    def shareCampaignUrl(campaign: String, elementId: Option[String]) = {
      elementId.map { block => s"$linkUrl/$campaign#$block" } getOrElse s"$linkUrl/$campaign"
    }

    lazy val facebook = shareCampaignUrl("sfb", elementId).urlEncoded
    lazy val googlePlus = shareCampaignUrl("sgp", elementId).urlEncoded
    lazy val link = shareCampaignUrl("sbl", elementId)
    lazy val twitter = shareCampaignUrl("stw", elementId).urlEncoded
    lazy val whatsapp = shareCampaignUrl("swa", elementId)
    lazy val webTitleAsciiEncoding = blockWebTitle.encodeURIComponent

    shareType match {
      case "facebook" => Some(ShareLink("Facebook", "facebook", "Share on Facebook", s"https://www.facebook.com/sharer/sharer.php?u=$facebook&ref=responsive"))
      case "twitter"  => Some(ShareLink("Twitter", "twitter", "Share on Twitter", s"https://twitter.com/intent/tweet?text=${title.urlEncoded}&url=$twitter"))
      case "gplus"    => Some(ShareLink("Google plus", "gplus", "Share on Google+", s"https://plus.google.com/share?url=$googlePlus&amp;hl=en-GB&amp;wwc=1"))
      case "whatsapp" => Some(ShareLink("WhatsApp", "whatsapp", "Share on WhatsApp", s"""whatsapp://send?text=${("\"" + title + "\" " + whatsapp).encodeURIComponent}"""))
      case "email"    => Some(ShareLink("Email", "email", "Share via Email", s"mailto:?subject=$webTitleAsciiEncoding&body=${linkUrl.urlEncoded}"))
      case "linkedin"  => Some(ShareLink("LinkedIn", "linkedin", "Share on LinkedIn", s"http://www.linkedin.com/shareArticle?mini=true&title=${title.urlEncoded}&url=${linkUrl.urlEncoded}"))
      case "pinterestPage"  => Some(ShareLink("Pinterest", "pinterest", "Share on Pinterest", s"http://www.pinterest.com/pin/find/?url=${linkUrl.urlEncoded}"))
      case "pinterestBlock"  => Some(ShareLink("Pinterest", "pinterest", "Share on Pinterest", s"http://www.pinterest.com/pin/create/button/?description=${title.urlEncoded}&url=${linkUrl.urlEncoded}&media=${mediaPath.getOrElse("").urlEncoded}"))
      case "link"     => Some(ShareLink("Link", "link", "Copy and Paste", link))
      case _ => None
    }
  }

  protected lazy val elementShareOrder = List("facebook", "twitter", "pinterestBlock")
  protected lazy val pageShareOrder = List("facebook", "twitter", "email", "linkedin", "gplus", "whatsapp")

  def elementShares(elementId: Option[String] = None, mediaPath: Option[String] = None, linkUrl: String = blockShortUrl, title: String = blockWebTitle): Seq[ShareLink] = elementShareOrder.flatMap(shareLink(_, elementId, mediaPath, linkUrl, title))

  lazy val pageShares: Seq[ShareLink] = pageShareOrder.flatMap(shareLink(_, linkUrl = blockShortUrl, title = blockWebTitle))
}

