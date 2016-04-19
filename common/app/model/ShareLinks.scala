package model

import java.net.URLEncoder

import campaigns.ShortCampaignCodes
import common.`package`._
import conf.Configuration.facebook.{ appId => facebookAppId }

case class ShareLink (
  platform: SharePlatform,
  href: String
) {
  val css: String = platform.css
  val text: String = platform.text
  val userMessage: String = platform.userMessage
}

sealed trait SharePlatform {
  def campaign: Option[String]
  def text: String
  def css: String
  def userMessage: String
}

object Facebook extends SharePlatform {
  override val campaign = Some("sfb")
  override val text = "Facebook"
  override val css = "facebook"
  override val userMessage = "Share on Facebook"
}
object GooglePlus extends SharePlatform {
  override val campaign = Some("sgp")
  override val text = "Google plus"
  override val css =  "gplus"
  override val userMessage = "Share on Google+"
}
object Email extends SharePlatform {
  override val campaign = Some("sbl")
  override val text = "Email"
  override val css =  "email"
  override val userMessage = "Share via Email"
}
object Twitter extends SharePlatform {
  override val campaign = Some("stw")
  override val text = "Twitter"
  override val css = "twitter"
  override val userMessage = "Share on Twitter"
}
object WhatsApp extends SharePlatform {
  override val campaign = Some("swa")
  override val text = "WhatsApp"
  override val css = "whatsapp"
  override val userMessage = "Share on WhatsApp"
}
object PinterestBlock extends SharePlatform {
  override val campaign = None
  override val text = "Pinterest"
  override val css = "pinterest"
  override val userMessage = "Share on Pinterest"
}
object PinterestPage extends SharePlatform {
  override val campaign = None
  override val text = "Pinterest"
  override val css = "pinterest"
  override val userMessage = "Share on Pinterest"
}
object LinkedIn extends SharePlatform {
  override val campaign = None
  override val text = "LinkedIn"
  override val css = "linkedin"
  override val userMessage = "Share on LinkedIn"
}

object ShareLinks {

  val defaultShares = List(Facebook, Twitter, PinterestBlock)

  private[model] def create(platform: SharePlatform, href: String, title: String, mediaPath: Option[String]): ShareLink = {

    val encodedHref = href.urlEncoded
    val fullMediaPath: Option[String] = mediaPath.map { originalPath =>
      if(originalPath.startsWith("//")) { "http:" + originalPath } else { originalPath }
    }

    lazy val facebookParams = List(
      Some("app_id" -> facebookAppId),
      Some("href" -> encodedHref),
      Some("redirect_uri" -> encodedHref),
      mediaPath.map(path => "picture" -> path.urlEncoded)
    ).flatten.toMap

    val fullLink = platform match {
      case GooglePlus => s"https://plus.google.com/share?url=$encodedHref&amp;hl=en-GB&amp;wwc=1"
      case WhatsApp => s"""whatsapp://send?text=${("\"" + title + "\" " + href).encodeURIComponent}"""
      case PinterestBlock => s"http://www.pinterest.com/pin/create/button/?description=${title.urlEncoded}&url=$encodedHref&media=${fullMediaPath.getOrElse("").urlEncoded}"
      case PinterestPage => s"http://www.pinterest.com/pin/find/?url=$encodedHref"
      case Email => s"mailto:?subject=${title.encodeURIComponent}&body=$encodedHref"
      case LinkedIn => s"http://www.linkedin.com/shareArticle?mini=true&title=${title.urlEncoded}&url=$encodedHref"
      case Facebook => s"https://www.facebook.com/dialog/share".appendQueryParams(facebookParams)
      case Twitter => s"https://twitter.com/intent/tweet?text=${title.encodeURIComponent}&url=$encodedHref"
    }

    ShareLink(platform, fullLink)
  }

  // A generic link constructor that works with absolute-url hrefs and creates links for each provided platform.
  // A campaign will be added to the href link.
  // The href only makes sense with long urls, because a CMP parameter can safely be added. Short urls are not supported here.
  def createShareLink(platform: SharePlatform, href: String, title: String, mediaPath: Option[String]): ShareLink = {
    val webUrlParams = platform.campaign.flatMap(ShortCampaignCodes.getFullCampaign).map(campaign => "CMP" -> campaign).toList.toMap
    val campaignHref = href.appendQueryParams(webUrlParams)
    create(platform, campaignHref, title, mediaPath)
  }

  def createShareLinks(platforms: Seq[SharePlatform], href: String, title: String, mediaPath: Option[String]): Seq[ShareLink] = {
    platforms.map(create(_, href, title, mediaPath))
  }
}

final case class ShareLinks(
  tags: Tags,
  fields: Fields,
  metadata: MetaData
) {

  private val pageShareOrder: List[SharePlatform] = if (tags.isGallery) {
    List(Facebook, Twitter, Email, PinterestPage, GooglePlus, WhatsApp)
  } else {
    List(Facebook, Twitter, Email, PinterestPage, LinkedIn, GooglePlus, WhatsApp)
  }

  private val elementShareOrder: List[SharePlatform] = if (tags.isLiveBlog) {
    List(Facebook, Twitter, GooglePlus)
  } else {
    List(Facebook, Twitter, PinterestBlock)
  }

  private def createShortUrlWithCampaign(platform: SharePlatform): String = platform.campaign match {
    case Some(campaign) => s"${fields.shortUrl}/$campaign"
    case _ => fields.shortUrl
  }

  def elementShares(elementId: String, mediaPath: Option[String]): Seq[ShareLink] = elementShareOrder.map( sharePlatform => {

    // Currently, only element shares on live blogs will use fully expanded urls. These urls take a CMP parameter.
    // Everything else uses short urls with campaign codes.
    val href = if (tags.isLiveBlog) {
      val webUrlParams = List(
        Some("page" -> s"with:$elementId"),
        sharePlatform.campaign.flatMap(ShortCampaignCodes.getFullCampaign).map(campaign => "CMP" -> campaign)
      ).flatten.toMap

      metadata.webUrl.addFragment(elementId).appendQueryParams(webUrlParams)
    } else {
      createShortUrlWithCampaign(sharePlatform).addFragment(elementId)
    }

    ShareLinks.create(sharePlatform, href = href, title = metadata.webTitle, mediaPath = mediaPath)
  })

  val pageShares: Seq[ShareLink] = pageShareOrder.map( sharePlatform => {
    val contentTitle = sharePlatform match {
      case Twitter if tags.isClimateChangeSeries => s"${metadata.webTitle} #keepitintheground"
      case _ => metadata.webTitle
    }

    val href = createShortUrlWithCampaign(sharePlatform)

    ShareLinks.create(sharePlatform, href = href, title = contentTitle, mediaPath = None)
  })
}
