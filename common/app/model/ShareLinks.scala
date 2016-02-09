package model

import java.net.URLEncoder

import campaigns.ShortCampaignCodes
import common.`package`._
import conf.Configuration.facebook.{ appId => facbookAppId }

case class ShareLink (
  text: String,
  css: String,
  userMessage: String,
  href: String
)

final case class ShareLinks(
  tags: Tags,
  fields: Fields,
  metadata: MetaData,
  elementShareOrder: List[String] = List("facebook", "twitter", "pinterestBlock"),
  pageShareOrder: List[String] = List("facebook", "twitter", "email", "pinterestPage", "linkedin", "gplus", "whatsapp")
) {
  private def shareLink(shareType: String, elementId: Option[String] = None, mediaPath: Option[String] = None, shortLinkUrl: String, webLinkUrl: String, title: String): Option[ShareLink] = {

    def createShareLinkUrl(campaign: Option[String], elementId: Option[String]): String = {
      val campaignParam = campaign.flatMap(ShortCampaignCodes.getFullCampaign(_))
      val url = elementId
        .flatMap(x => {
          if (tags.isLiveBlog) {
            val queryParams: Map[String, String] = Map(
              "page" -> elementId.filter(x => tags.isLiveBlog).map(id => s"with:$id"),
              "CMP" -> campaignParam
            )
              .filter(_._2.isDefined)
              .map { case (k, v) => (k, v.getOrElse("")) }

            Some(webLinkUrl.appendQueryParams(queryParams))
          } else None
        })
        .getOrElse(campaign.map(campaign => s"$shortLinkUrl/$campaign").getOrElse(shortLinkUrl))

      url + elementId.map(id => s"#${id}").getOrElse("")
    }

    lazy val facebook = createShareLinkUrl(Some("sfb"), elementId).urlEncoded
    lazy val googlePlus = createShareLinkUrl(Some("sgp"), elementId).urlEncoded
    lazy val link = createShareLinkUrl(Some("sbl"), elementId).urlEncoded
    lazy val twitter = createShareLinkUrl(Some("stw"), elementId).urlEncoded
    lazy val whatsapp = createShareLinkUrl(Some("swa"), elementId)
    lazy val pinterest = createShareLinkUrl(None, elementId).urlEncoded
    lazy val linkedIn = createShareLinkUrl(None, elementId).urlEncoded
    lazy val webTitleAsciiEncoding = metadata.webTitle.encodeURIComponent

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
        val text = if (tags.isClimateChangeSeries) {
          s"${title.encodeURIComponent} ${URLEncoder.encode("#keepitintheground", "utf-8")}"
        } else {
          title.encodeURIComponent
        }
        Some(ShareLink("Twitter", "twitter", "Share on Twitter", s"https://twitter.com/intent/tweet?text=$text&url=$twitter"))

      case "gplus"    => Some(ShareLink("Google plus", "gplus", "Share on Google+", s"https://plus.google.com/share?url=$googlePlus&amp;hl=en-GB&amp;wwc=1"))
      case "whatsapp" => Some(ShareLink("WhatsApp", "whatsapp", "Share on WhatsApp", s"""whatsapp://send?text=${("\"" + title + "\" " + whatsapp).encodeURIComponent}"""))
      case "email"    => Some(ShareLink("Email", "email", "Share via Email", s"mailto:?subject=$webTitleAsciiEncoding&body=$link"))
      case "linkedin"  => Some(ShareLink("LinkedIn", "linkedin", "Share on LinkedIn", s"http://www.linkedin.com/shareArticle?mini=true&title=${title.urlEncoded}&url=$linkedIn"))
      case "pinterestPage"  => Some(ShareLink("Pinterest", "pinterest", "Share on Pinterest", s"http://www.pinterest.com/pin/find/?url=$pinterest"))
      case "pinterestBlock"  => Some(ShareLink("Pinterest", "pinterest", "Share on Pinterest", s"http://www.pinterest.com/pin/create/button/?description=${title.urlEncoded}&url=$pinterest&media=${fullMediaPath.getOrElse("").urlEncoded}"))
      case _ => None
    }
  }

  def elementShares(
    elementId: Option[String] = None,
    mediaPath: Option[String] = None,
    shortLinkUrl: String = fields.shortUrl,
    webLinkUrl: String = metadata.webUrl,
    title: String = metadata.webTitle): Seq[ShareLink] =
    elementShareOrder.flatMap(shareLink(_, elementId, mediaPath, shortLinkUrl, webLinkUrl, title))

  lazy val pageShares: Seq[ShareLink] = pageShareOrder.flatMap(shareLink(_, shortLinkUrl = fields.shortUrl, webLinkUrl = metadata.webUrl, title = metadata.webTitle))
}

