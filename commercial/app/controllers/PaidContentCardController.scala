package commercial.controllers

import common.{ExecutionContexts, Logging}
import contentapi.ContentApiClient
import model.commercial.Lookup
import model.{Cached, NoCache}
import play.api.mvc._
import views.support.Item300
import views.support.commercial.TrackingCodeBuilder

class PaidContentCardController(contentApiClient: ContentApiClient) extends Controller with ExecutionContexts with implicits.Requests with Logging {

  private val lookup = new Lookup(contentApiClient)

  private def renderCard(format: Format) = Action.async { implicit request =>

    val shortUrl = request.getParameter("articleUrl")

    lookup.contentByShortUrls(shortUrl.toList) map { contents =>
      contents.headOption map { content =>
        val articleUrl = content.metadata.webUrl
        val articleTitle = request.getParameter("articleHeaderText") getOrElse content.metadata.webTitle
        val leaveTextEmpty = request.getParameter("leaveTextEmpty").exists(_ != "No")
        val pictureUrl: Option[String] =
          request.getParameter("articleImage") orElse content.trail.trailPicture.flatMap(Item300.bestFor)
        val brandLogo = request.getParameter("brandLogo")
        val brand = request.getParameter("brand")
        val linkLabel = request.getParameter("linkLabel")
        val optClickMacro = request.getParameter("clickMacro")
        val optOmnitureId = request.getParameter("omnitureId")
        val trackingPixel = request.getParameter("trackingPixel")
        val cacheBuster = request.getParameter("cacheBuster")

        val articleText = if (!leaveTextEmpty) {
          request.getParameter("articleText") orElse content.fields.trailText
        } else None

        Cached(componentMaxAge) {
          format.result(views.html.paidContent.card(
            articleUrl,
            articleTitle,
            articleText,
            pictureUrl,
            brandLogo,
            brand,
            linkLabel,
            linkTracking = optOmnitureId getOrElse TrackingCodeBuilder.paidCard(articleTitle),
            optClickMacro,
            trackingPixel,
            cacheBuster
          ))
        }
      } getOrElse {
        NoCache(format.nilResult.result)
      }
    }
  }

  def cardHtml = renderCard(htmlFormat)
  def cardJson = renderCard(jsonFormat)
}
