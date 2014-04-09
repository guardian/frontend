package controllers

import play.api.mvc.{ Controller, Action, RequestHeader }
import common._
import model._
import scala.concurrent.Future
import implicits.Requests
import conf.SwitchingContentApi
import com.gu.openplatform.contentapi.ApiError
import com.gu.openplatform.contentapi.model.{Content => ApiContent}
import views.support.{MultimediaContainer, TemplateDeduping, FeaturesContainer}

object ToneController extends Controller with Logging with Paging with ExecutionContexts with Requests {

  implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  def render(tone: String) = Action.async { implicit request =>
    val response = lookup(Edition(request), s"tone/$tone") map { toneItems =>
      toneItems map { trail => renderToneTrails(trail, tone) }
    }
    response map { _ getOrElse NotFound }
  }

  private def lookup( edition: Edition, toneId: String)(implicit request: RequestHeader): Future[Option[Seq[Content]]] = {
    val currentShortUrl = request.getQueryString("shortUrl").getOrElse("")
    log.info(s"Fetching content in tone: ${toneId} the ShortUrl ${currentShortUrl}" )

    def isCurrentStory(content: ApiContent) = content.safeFields.get("shortUrl").map{shortUrl => !shortUrl.equals(currentShortUrl)}.getOrElse(false)

    val promiseOrResponse = SwitchingContentApi().item(toneId, edition)
      .showTags("all")
      .showFields("all")
      .response
      .map {
        response =>
          response.results filter { content => isCurrentStory(content) } map { result =>
            Content(result)
          } match {
            case Nil => None
            case results => Some(results)
          }
      }

      promiseOrResponse.recover{ case ApiError(404, message) =>
         log.info(s"Got a 404 calling content api: $message" )
         None
      }
  }

  private def renderToneTrails(trails: Seq[Content], toneId: String)(implicit request: RequestHeader) = {
    val tone = request.getQueryString("tone").getOrElse("")
    val response = () => views.html.fragments.containers.features(Config(id = tone, href = Option(toneId), displayName = Some(s"More $tone") ), Collection(trails.take(7)), FeaturesContainer(), 0)
    renderFormat(response, response, 1)
  }
}
