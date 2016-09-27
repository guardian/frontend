package controllers.commercial

import common.commercial._
import common.{Edition, ExecutionContexts, JsonComponent, Logging}
import contentapi.ContentApiClient
import model.commercial.{CapiAgent, Lookup}
import model.{Cached, NoCache}
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.mvc._
import model._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

import views.support.ImgSrc
import cards.{Half, Third, Standard}
import layout.{FaciaWidths, ItemClasses, BrowserWidth, BreakpointWidth}

sealed abstract class SponsorType(val className: String)
case object PaidFor extends SponsorType("paidfor")
case object Supported extends SponsorType("supported")

class ContentApiOffersController(contentApiClient: ContentApiClient, capiAgent: CapiAgent) extends Controller with ExecutionContexts with implicits.Requests with Logging {

  private val lookup = new Lookup(contentApiClient)

  private val sponsorTypeToClassRefactor = Map(
    "sponsored" -> Supported,
    "advertisement-feature" -> PaidFor,
    "foundation-supported" -> Supported
  )

  private val sponsorTypeToLabel = Map(
    "sponsored" -> "Supported by",
    "advertisement-feature" -> "Paid for by",
    "foundation-supported" -> "Supported by"
  )

  private def renderItems(format: Format, isMulti: Boolean) = Action.async { implicit request =>

    val optKeyword = request.getParameter("k")

    val eventualLatest = optKeyword.map { keyword =>
      // getting twice as many, as we filter out content without images
      lookup.latestContentByKeyword(keyword, 8)
    }.getOrElse(Future.successful(Nil))

    eventualLatest onFailure {
      case NonFatal(e) => log.error(s"Looking up content by keyword failed: ${e.getMessage}")
    }

    val eventualSpecific = capiAgent.contentByShortUrls(specificIds)

    eventualSpecific onFailure {
      case NonFatal(e) => log.error(s"Looking up content by short URL failed: ${e.getMessage}")
    }

    val futureContents = for {
      specific <- eventualSpecific
      latestByKeyword <- eventualLatest
    } yield {
      (specific ++ latestByKeyword.filter(_.trail.trailPicture.nonEmpty)).distinct take 4
    }

    futureContents.map(_.toList) map {
      case Nil => NoCache(format.nilResult.result)
      case contents => Cached(componentMaxAge) {

        val edition = Edition(request)
        val optSection = request.getParameter("s")
        val optLogo = request.getParameter("l")
        val optCapiTitle = request.getParameter("ct")
        val optCapiLink = request.getParameter("cl")
        val optCapiAbout = request.getParameter("cal")
        val optCapiButtonText = request.getParameter("clt")
        val optCapiReadMoreUrl = request.getParameter("rmd")
        val optCapiReadMoreText = request.getParameter("rmt")
        val optCapiAdFeature = request.getParameter("af")
        val optClickMacro = request.getParameter("clickMacro")
        val optOmnitureId = request.getParameter("omnitureId")
        val omnitureId = optOmnitureId orElse optCapiTitle getOrElse ""
        val optSponsorTypeRefactor = optCapiAdFeature flatMap (feature => sponsorTypeToClassRefactor.get(feature))
        val optSponsorLabel = optCapiAdFeature flatMap (feature => sponsorTypeToLabel.get(feature))

        if (isMulti) {
          format.result(views.html.contentapi.items(
            contents map (CardContent.fromContentItem(_, edition, optClickMacro, withDescription = false)),
            optSection,
            optLogo,
            optCapiTitle,
            optCapiLink,
            optCapiAbout,
            optClickMacro,
            omnitureId,
            optCapiAdFeature,
            optSponsorTypeRefactor,
            optSponsorLabel)
          )
        } else {
          format.result(views.html.contentapi.item(
            CardContent.fromContentItem(contents.head, edition, optClickMacro, withDescription = true),
            optSection,
            optLogo,
            optCapiTitle,
            optCapiLink,
            optCapiAbout,
            optCapiButtonText,
            optCapiReadMoreUrl,
            optCapiReadMoreText,
            optSponsorTypeRefactor,
            optSponsorLabel,
            optClickMacro,
            omnitureId
          ))
        }
      }
    }
  }

  // Holds the source element data for the images.
  case class ImageSource (minWidth: String, sizes: String,
    hidpiSrcset: String, lodpiSrcset: String)

  // Holds all source element data and the backup image src for older browsers.
  case class ImageInfo (sources: Seq[ImageSource], backupSrc: String)

  case class CapiSingle(articleHeadline: String, articleUrl: String, articleText: Option[String], articleImage: ImageInfo, audioTag: Boolean,
                        galleryTag: Boolean, videoTag: Boolean)

  object CapiSingle {
    import ElementsFormat._

    def fromContent(content: Content): CapiSingle = {

      val imageData = content.trail.trailPicture
      val fallbackImageUrl = content.trail.trailPicture flatMap
        ImgSrc.getFallbackUrl

      // val cardType = Math.min(noCards, 4) match {
      //   case 3 => Third
      //   case 2 => Half
      //   case _ => Standard
      // }

      val cardType = Standard

      val breakpointWidths = FaciaWidths.mediaFromItemClasses(ItemClasses(
        mobile = Standard,
        tablet = cardType,
        desktop = Some(cardType)
      )).breakpoints

      val sources = breakpointWidths.map { breakpointWidth =>
        ImageSource(
          breakpointWidth.breakpoint.minWidth.getOrElse("0").toString,
          breakpointWidth.width.toString,
          ImgSrc.srcsetForBreakpoint(breakpointWidth, breakpointWidths, None,
            imageData, hidpi = true),
          ImgSrc.srcsetForBreakpoint(breakpointWidth, breakpointWidths, None,
            imageData)
        )
      }

      val imageInfo = ImageInfo(sources, fallbackImageUrl.getOrElse(""))

      CapiSingle(content.trail.headline, content.metadata.webUrl,
        content.trail.fields.trailText, imageInfo, content.tags.isAudio,
        content.tags.isGallery, content.tags.isVideo)
    }

    implicit val writesCapiSingle: Writes[CapiSingle] = Json.writes[CapiSingle]
  }

  object ImageInfo {
    implicit val writesImageInfo: Writes[ImageInfo] = Json.writes[ImageInfo]
  }

  object ImageSource {
    implicit val writesImageSource: Writes[ImageSource] = Json.writes[ImageSource]
  }

  private def renderNative(format: Format, isMulti: Boolean) = Action.async { implicit request =>

    val optKeyword = request.getParameter("k")

    val latestContent = optKeyword.map { keyword =>
      // getting twice as many, as we filter out content without images
      lookup.latestContentByKeyword(keyword, 2)
    }.getOrElse(Future.successful(Nil))

    latestContent onFailure {
      case NonFatal(e) => log.error(s"Looking up content by keyword failed: ${e.getMessage}")
    }

    val specificContent: Future[Seq[model.ContentType]] = capiAgent.contentByShortUrls(specificIds)

    specificContent onFailure {
      case NonFatal(e) => log.error(s"Looking up content by short URL failed: ${e.getMessage}")
    }

    val futureContents = for {
      specific <- specificContent
      latestByKeyword <- latestContent
    } yield {
      (specific ++ latestByKeyword.filter(_.trail.trailPicture.nonEmpty)).distinct take 1
    }

    futureContents.map((content: Seq[model.ContentType]) => {
      val response = content.head
      val capiSingle = CapiSingle.fromContent(response.content)
      Cached(60.seconds) {
        JsonComponent(capiSingle)
      }
    })

  }

  def nativeJson = renderNative(jsonFormat, isMulti = false)
  def nativeJsonMulti = renderNative(jsonFormat, isMulti = true)

  def itemsHtml = renderItems(htmlFormat, isMulti = true)
  def itemsJson = renderItems(jsonFormat, isMulti = true)

  def itemHtml = renderItems(htmlFormat, isMulti = false)
  def itemJson = renderItems(jsonFormat, isMulti = false)
}
