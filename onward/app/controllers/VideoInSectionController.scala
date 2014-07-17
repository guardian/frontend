package controllers

import play.api.mvc.{ Controller, Action, RequestHeader }
import common._
import model._
import scala.concurrent.Future
import implicits.Requests
import conf.LiveContentApi
import com.gu.openplatform.contentapi.ApiError
import com.gu.openplatform.contentapi.model.{Content => ApiContent}
import views.support.{MultimediaContainer, TemplateDeduping}

object VideoInSectionController extends Controller with Logging with Paging with ExecutionContexts with Requests {

  implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  def renderSectionVideos(sectionId: String) = Action.async { implicit request =>
    val response = lookup(Edition(request), sectionId) map { seriesItems =>
      seriesItems map { trail => renderSectionTrails(trail, sectionId) }
    }
    response map { _ getOrElse NotFound }
  }

  private def lookup(edition: Edition, sectionId: String)(implicit request: RequestHeader): Future[Option[Seq[Content]]] = {
    val currentShortUrl = request.getQueryString("shortUrl").getOrElse("")
    log.info(s"Fetching video content in section: ${sectionId}" )

    def isCurrentStory(content: ApiContent) = content.safeFields.get("shortUrl").map{ shortUrl => !shortUrl.equals(currentShortUrl) }.getOrElse(false)

    val promiseOrResponse = LiveContentApi.search(edition)
      .section(sectionId)
      .tag("type/video")
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

  private def renderSectionTrails(trails: Seq[Content], sectionId: String)(implicit request: RequestHeader) = {
    val sectionName = request.getQueryString("sectionName").getOrElse("")
    implicit val config = Config(id = sectionId, href = Option(sectionId), displayName = Some(s"More ${sectionName} videos") )
    val response = () => views.html.fragments.containers.multimedia(Collection(trails.take(3)), MultimediaContainer(), 1)
    renderFormat(response, response, 1)
  }
}
