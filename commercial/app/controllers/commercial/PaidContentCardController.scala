package controllers.commercial

import common.{ExecutionContexts, Logging}
import model.commercial.Lookup
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._
import views.support.Item300

object PaidContentCardController extends Controller with ExecutionContexts with implicits.Requests with Logging {

  private def renderCard(format: Format) = MemcachedAction { implicit request =>

    val shortUrl = request.getParameter("articleUrl")

    Lookup.contentByShortUrls(shortUrl.toList) map { contents =>
      contents.headOption map { content =>
        val articleUrl = content.metadata.webUrl
        val articleTitle = request.getParameter("articleHeaderText") getOrElse content.metadata.webTitle
        val leaveTextEmpty = request.getParameter("leaveTextEmpty") == "Yes"
        val articleText = getParameter("articleText") orElse if (!leaveTextEmpty) content.fields.trailText else ""
        val pictureUrl: Option[String] = request.getParameter("articleImage") orElse (content.trail.trailPicture.flatMap(Item300.bestFor))
        val brandLogo = request.getParameter("brandLogo")
        val brand = request.getParameter("brand")
        val linkLabel = request.getParameter("linkLabel")
        val optClickMacro = request.getParameter("clickMacro")
        val optOmnitureId = request.getParameter("omnitureId")
        val trackingPixel = request.getParameter("trackingPixel")
        val cacheBuster = request.getParameter("cacheBuster")

        Cached(componentMaxAge) {
          format.result(views.html.paidContent.card(articleUrl, articleTitle, articleText, pictureUrl, brandLogo, brand, linkLabel, optClickMacro, optOmnitureId, trackingPixel, cacheBuster))
        }
      } getOrElse {
        NoCache(format.nilResult)
      }
    }
  }

  def cardHtml = renderCard(htmlFormat)
  def cardJson = renderCard(jsonFormat)
}
