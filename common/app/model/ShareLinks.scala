package model

import commercial.campaigns.ShortCampaignCodes
import common.`package`._
import conf.Configuration.facebook.{appId => facebookAppId}

case class ShareLink(
    platform: SharePlatform,
    href: String,
) {
  val css: String = platform.css
  val text: String = platform.text
  val userMessage: String = platform.userMessage
}

final case class ShareLinkMeta(
    visible: Seq[ShareLink],
    hidden: Seq[ShareLink],
)

object ShareLinkMeta {
  def noneHidden(shares: ShareLinkMeta): ShareLinkMeta =
    ShareLinkMeta(shares.visible ++ shares.hidden, Nil)
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

object Messenger extends SharePlatform {
  override val campaign = Some("sme")
  override val text = "Messenger"
  override val css = "messenger"
  override val userMessage = "Share on Messenger"
}

object Email extends SharePlatform {
  override val campaign = Some("sbl")
  override val text = "Email"
  override val css = "email"
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

  private[model] def create(
      platform: SharePlatform,
      href: String,
      title: String,
      mediaPath: Option[String],
      quote: Option[String] = None,
  ): ShareLink = {

    val encodedHref = href.urlEncoded
    val fullMediaPath: Option[String] = mediaPath.map { originalPath =>
      if (originalPath.startsWith("//")) { "http:" + originalPath }
      else { originalPath }
    }

    lazy val facebookParams = List(
      Some("app_id" -> facebookAppId),
      Some("href" -> href),
      quote.map(q => "quote" -> q),
      mediaPath.map(path => "picture" -> path),
    ).flatten.toMap

    // add a hairspace to prevent Twitter recognising this text as a URL and thus not rendering the article url
    lazy val twitterText = title.replace("Leave.EU", "Leave. EU").encodeURIComponent

    val fullLink = platform match {
      case WhatsApp => s"""whatsapp://send?text=${("\"" + title + "\" " + href).encodeURIComponent}"""
      case PinterestBlock =>
        s"http://www.pinterest.com/pin/create/button/?description=${title.urlEncoded}&url=$encodedHref&media=${fullMediaPath.getOrElse("").urlEncoded}"
      case PinterestPage => s"http://www.pinterest.com/pin/find/?url=$encodedHref"
      case Email         => s"mailto:?subject=${title.encodeURIComponent}&body=$encodedHref"
      case LinkedIn      => s"http://www.linkedin.com/shareArticle?mini=true&title=${title.urlEncoded}&url=$encodedHref"
      case Facebook      => s"https://www.facebook.com/dialog/share".appendQueryParams(facebookParams)
      case Twitter       => s"https://twitter.com/intent/tweet?text=$twitterText&url=$encodedHref"
      case Messenger     => s"fb-messenger://share?link=$encodedHref&app_id=180444840287"
    }

    ShareLink(platform, fullLink)
  }

  // A generic link constructor that works with absolute-url hrefs and creates links for each provided platform.
  // A campaign will be added to the href link.
  // The href only makes sense with long urls, because a CMP parameter can safely be added. Short urls are not supported here.
  def createShareLink(platform: SharePlatform, href: String, title: String, mediaPath: Option[String]): ShareLink = {
    val webUrlParams =
      platform.campaign.flatMap(ShortCampaignCodes.getFullCampaign).map(campaign => "CMP" -> campaign).toList.toMap
    val campaignHref = href.appendQueryParams(webUrlParams)
    create(platform, campaignHref, title, mediaPath)
  }

  // TODO: Use campaign codes
  def createShareLinkForComment(
      platform: SharePlatform,
      href: String,
      text: String,
      quote: Option[String] = None,
  ): ShareLink = {
    create(platform, href, text, None, quote)
  }

  def createShareLinks(
      platforms: Seq[SharePlatform],
      href: String,
      title: String,
      mediaPath: Option[String],
      quote: Option[String] = None,
  ): Seq[ShareLink] = {
    platforms.map(create(_, href, title, mediaPath, quote))
  }
}

final case class ShareLinks(
    tags: Tags,
    fields: Fields,
    metadata: MetaData,
) {

  private val elementShareOrder: List[SharePlatform] = if (tags.isLiveBlog) {
    List(Facebook, Twitter)
  } else {
    List(Facebook, Twitter, PinterestBlock)
  }

  private def campaignParams(platform: SharePlatform): Map[String, String] = {
    platform.campaign
      .flatMap(ShortCampaignCodes.getFullCampaign)
      .map(campaign => Map("CMP" -> campaign))
      .getOrElse(Map.empty)
  }

  private def sharesToLinks(sharePlatforms: List[SharePlatform]): List[ShareLink] =
    sharePlatforms.map { sharePlatform =>
      val webUrlParams = campaignParams(sharePlatform)
      val href = metadata.webUrl.appendQueryParams(webUrlParams)

      val contentTitle = sharePlatform match {
        case Twitter if tags.isClimateChangeSeries => s"${metadata.webTitle} #keepitintheground"
        case _                                     => metadata.webTitle
      }

      ShareLinks.create(sharePlatform, href = href, title = contentTitle, mediaPath = None)
    }

  def elementShares(elementId: String, mediaPath: Option[String]): Seq[ShareLink] =
    elementShareOrder.map(sharePlatform => {
      val webUrlParams = campaignParams(sharePlatform)
      val href = metadata.webUrl.addFragment(elementId).appendQueryParams(webUrlParams + ("page" -> s"with:$elementId"))
      ShareLinks.create(sharePlatform, href = href, title = metadata.webTitle, mediaPath = mediaPath)
    })

  val pageShares: ShareLinkMeta = ShareLinkMeta(
    sharesToLinks(List(Facebook, Twitter, Email)),
    sharesToLinks(List(LinkedIn, PinterestPage, WhatsApp, Messenger)),
  )
}
