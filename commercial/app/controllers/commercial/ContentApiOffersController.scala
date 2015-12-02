package controllers.commercial

import common.{ExecutionContexts, Logging}
import model.commercial.{CapiAgent, Lookup}
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future
import scala.util.control.NonFatal

object ContentApiOffersController extends Controller with ExecutionContexts with implicits.Requests with Logging {

  private val sponsorTypeToClass = Map(
    "sponsored" -> "fc-container--sponsored",
    "advertisement-feature" -> "fc-container--advertisement-feature",
    "foundation-supported" -> "fc-container--foundation-supported"
  )

  private val sponsorTypeToLabel = Map(
    "sponsored" -> "Sponsored by",
    "advertisement-feature" -> "Brought to you by",
    "foundation-supported" -> "Supported by"
  )

  private def renderItems(format: Format, isMulti: Boolean) = MemcachedAction { implicit request =>

    val optKeyword = request.getParameter("k")
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

    val optSponsorType = optCapiAdFeature flatMap (feature => sponsorTypeToClass.get(feature))
    val optSponsorLabel = optCapiAdFeature flatMap (feature => sponsorTypeToLabel.get(feature))

    val eventualLatest = optKeyword.map { keyword =>
      // getting twice as many, as we filter out content without images
      Lookup.latestContentByKeyword(keyword, 8)
    }.getOrElse(Future.successful(Nil))

    eventualLatest onFailure {
      case NonFatal(e) => log.error(s"Looking up content by keyword failed: ${e.getMessage}")
    }

    val eventualSpecific = CapiAgent.contentByShortUrls(specificIds)

    eventualSpecific onFailure {
      case NonFatal(e) => log.error(s"Looking up content by short URL failed: ${e.getMessage}")
    }

    val futureContents = for {
      specific <- eventualSpecific
      latestByKeyword <- eventualLatest
    } yield {
      (specific ++ latestByKeyword.filter(_.trailPicture.nonEmpty)).distinct take 4
    }

    futureContents map {
      case Nil => NoCache(format.nilResult)
      case contents => Cached(componentMaxAge) {
        if (isMulti) {
          format.result(views.html.contentapi.items(contents, optLogo, optCapiTitle, optCapiLink, optCapiAbout, optClickMacro, optOmnitureId, optCapiAdFeature, optSponsorType, optSponsorLabel))
        } else {
          format.result(views.html.contentapi.item(contents.head, optLogo, optCapiTitle, optCapiLink, optCapiAbout, optCapiButtonText, optCapiReadMoreUrl, optCapiReadMoreText, optSponsorType, optSponsorLabel, optClickMacro, optOmnitureId))
        }
      }
    }
  }

  def itemsHtml = renderItems(htmlFormat, isMulti = true)
  def itemsJson = renderItems(jsonFormat, isMulti = true)

  def itemHtml = renderItems(htmlFormat, isMulti = false)
  def itemJson = renderItems(jsonFormat, isMulti = false)
}
