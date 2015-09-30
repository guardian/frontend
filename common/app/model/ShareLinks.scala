package model

import java.net.URLEncoder

import common.`package`._
import conf.Configuration.facebook.{ appId => facbookAppId }

case class ShareLink (
  text: String,
  css: String,
  userMessage: String,
  href: String
)

trait ShareLinks { self: Content =>

  private def shareLink(shareType: String, elementId: Option[String] = None, mediaPath: Option[String] = None, shortLinkUrl: String, webLinkUrl: String, title: String): Option[ShareLink] = {

    def shareCampaignUrl(campaign: String, elementId: Option[String]) = {
      elementId.map { block => s"$shortLinkUrl/$campaign#$block" } getOrElse s"$shortLinkUrl/$campaign"
    }

    lazy val facebook = shareCampaignUrl("sfb", elementId).urlEncoded
    lazy val googlePlus = shareCampaignUrl("sgp", elementId).urlEncoded
    lazy val link = shareCampaignUrl("sbl", elementId).urlEncoded
    lazy val twitter = shareCampaignUrl("stw", elementId).urlEncoded
    lazy val whatsapp = shareCampaignUrl("swa", elementId)
    lazy val webTitleAsciiEncoding = webTitle.encodeURIComponent

    lazy val fullMediaPath: Option[String] = {
      mediaPath.map { originalPath => if(originalPath.startsWith("//")) { "http:" + originalPath } else { originalPath } }
    }

    shareType match {
      case "facebook" =>
        val imageUrl = mediaPath.map(_.urlEncoded).map(url => s"&picture=$url").getOrElse("")
        Some(ShareLink(
        "Facebook", "facebook",
        "Share on Facebook",
        s"https://www.facebook.com/dialog/share?app_id=${facbookAppId}&href=$facebook&redirect_uri=${shortLinkUrl.urlEncoded}$imageUrl")
        )

      case "twitter"  =>
        val text = if (this.isClimateChangeSeries) {
          s"${title.encodeURIComponent} ${URLEncoder.encode("#keepitintheground", "utf-8")}"
        } else {
          title.encodeURIComponent
        }
        Some(ShareLink("Twitter", "twitter", "Share on Twitter", s"https://twitter.com/intent/tweet?text=$text&url=$twitter"))

      case "gplus"    => Some(ShareLink("Google plus", "gplus", "Share on Google+", s"https://plus.google.com/share?url=$googlePlus&amp;hl=en-GB&amp;wwc=1"))
      case "whatsapp" => Some(ShareLink("WhatsApp", "whatsapp", "Share on WhatsApp", s"""whatsapp://send?text=${("\"" + title + "\" " + whatsapp).encodeURIComponent}"""))
      case "email"    => Some(ShareLink("Email", "email", "Share via Email", s"mailto:?subject=$webTitleAsciiEncoding&body=$link"))
      case "linkedin"  => Some(ShareLink("LinkedIn", "linkedin", "Share on LinkedIn", s"http://www.linkedin.com/shareArticle?mini=true&title=${title.urlEncoded}&url=${shortLinkUrl.urlEncoded}"))
      case "pinterestPage"  => Some(ShareLink("Pinterest", "pinterest", "Share on Pinterest", s"http://www.pinterest.com/pin/find/?url=${webLinkUrl.urlEncoded}"))
      case "pinterestBlock"  => Some(ShareLink("Pinterest", "pinterest", "Share on Pinterest", s"http://www.pinterest.com/pin/create/button/?description=${title.urlEncoded}&url=${webLinkUrl.urlEncoded}&media=${fullMediaPath.getOrElse("").urlEncoded}"))
      case _ => None
    }
  }

  protected lazy val elementShareOrder = List("facebook", "twitter", "pinterestBlock")
  protected lazy val pageShareOrder = List("facebook", "twitter", "email", "pinterestPage", "linkedin", "gplus", "whatsapp")

  def elementShares(elementId: Option[String] = None, mediaPath: Option[String] = None, shortLinkUrl: String = shortUrl, webLinkUrl: String = webUrl, title: String = webTitle): Seq[ShareLink] =
    elementShareOrder.flatMap(shareLink(_, elementId, mediaPath, shortLinkUrl, webLinkUrl, title))

  lazy val pageShares: Seq[ShareLink] = pageShareOrder.flatMap(shareLink(_, shortLinkUrl = shortUrl, webLinkUrl = webUrl, title = webTitle))
}

