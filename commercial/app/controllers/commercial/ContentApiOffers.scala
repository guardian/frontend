package controllers.commercial

import common.ExecutionContexts
import model.commercial.Lookup
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future

object ContentApiOffers extends Controller with ExecutionContexts with implicits.Requests {

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

    val optCapiSupportedBy = request.getParameter("sb")

    val futureLatestByKeyword = optKeyword.map { keyword =>
      Lookup.latestContentByKeyword(keyword, 4)
    }.getOrElse(Future.successful(Nil))

    val futureContents = for {
      specific <- Lookup.contentByShortUrls(specificIds)
      latestByKeyword <- futureLatestByKeyword
    } yield (specific ++ latestByKeyword).distinct take 4

    futureContents map {
      case Nil => NoCache(format.nilResult)
      case contents => Cached(componentMaxAge) {
        if (isMulti) {
          format.result(views.html.contentapi.items(contents, optLogo, optCapiTitle, optCapiLink, optCapiAbout))
        } else {
          format.result(views.html.contentapi.item(contents.head, optLogo, optCapiTitle, optCapiLink, optCapiAbout, optCapiButtonText, optCapiReadMoreUrl, optCapiReadMoreText, optCapiAdFeature, optCapiSupportedBy))
        }
      }
    }
  }

  def itemsHtml = renderItems(htmlFormat, isMulti = true)
  def itemsJson = renderItems(jsonFormat, isMulti = true)

  def itemHtml = renderItems(htmlFormat, isMulti = false)
  def itemJson = renderItems(jsonFormat, isMulti = false)
}
