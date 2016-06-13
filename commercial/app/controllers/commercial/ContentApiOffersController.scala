package controllers.commercial

import common.commercial._
import common.{ExecutionContexts, Logging, Edition}
import model.commercial.{CapiAgent, Lookup}
import model.{Cached, NoCache}
import play.api.mvc._

import scala.concurrent.Future
import scala.util.control.NonFatal

sealed abstract class SponsorType(val className: String)
case object PaidFor extends SponsorType("paidfor")
case object Supported extends SponsorType("supported")

object ContentApiOffersController extends Controller with ExecutionContexts with implicits.Requests with Logging {

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

  def itemsHtml = renderItems(htmlFormat, isMulti = true)
  def itemsJson = renderItems(jsonFormat, isMulti = true)

  def itemHtml = renderItems(htmlFormat, isMulti = false)
  def itemJson = renderItems(jsonFormat, isMulti = false)
}
