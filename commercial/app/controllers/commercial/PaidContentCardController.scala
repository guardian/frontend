package controllers.commercial

import common.{ExecutionContexts, Logging}
import model.commercial.{CapiAgent, Lookup}
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future
import scala.util.control.NonFatal

object PaidContentCardController extends Controller with ExecutionContexts with implicits.Requests with Logging {

  private def renderCard(format: Format) = MemcachedAction { implicit request =>

    val optKeyword = request.getParameter("k")
    /*val optLogo = request.getParameter("l")
    val optCapiTitle = request.getParameter("ct")
    val optCapiLink = request.getParameter("cl")
    val optCapiAbout = request.getParameter("cal")
    val optCapiButtonText = request.getParameter("clt")
    val optCapiReadMoreUrl = request.getParameter("rmd")
    val optCapiReadMoreText = request.getParameter("rmt")
    val optCapiAdFeature = request.getParameter("af")*/
    val optClickMacro = request.getParameter("clickMacro")
    val optOmnitureId = request.getParameter("omnitureId")

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

    futureContents map {
      case Nil => NoCache(format.nilResult)
      case contents => Cached(componentMaxAge) {
        format.result(views.html.paidContent.card(contents.head, optClickMacro, optOmnitureId))
      }
    }
  }

  def cardHtml = renderCard(htmlFormat)
  def cardJson = renderCard(jsonFormat)
}
