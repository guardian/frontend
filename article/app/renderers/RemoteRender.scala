package renderers

import common.JsonComponent
import conf.Configuration
import controllers.ArticlePage
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, ContentFields, NoCache, PageWithStoryPackage}
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.api.mvc.Results.InternalServerError

import scala.concurrent.{ExecutionContext, Future}
import play.twirl.api.Html

import scala.concurrent.duration._
import common.RichRequestHeader
import staticpages.StaticPages

import ExecutionContext.Implicits.global

class RemoteRender(implicit context: ApplicationContext) {

  private def remoteRenderArticle(ws:WSClient, payload: String, article: ArticlePage)(implicit request: RequestHeader): Future[Result] = ws.url(Configuration.rendering.renderingEndpoint)
    .withRequestTimeout(2000.millis)
    .addHttpHeaders("Content-Type" -> "application/json")
    .post(payload)
    .map(response => {
      response.status match {
        case 200 =>
          Cached(article)(RevalidatableResult.Ok(Html(response.body)))
        case _ =>
          throw new Exception(response.body)
      }
    })

  def render(ws:WSClient, path: String, article: ArticlePage)(implicit request: RequestHeader): Future[Result] = {

    val contentFieldsJson = List(
      "contentFields" -> Json.toJson(ContentFields(article.article)),
      "tags" -> Json.toJson(article.article.tags)
    )
    val jsonResponse = List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
    val jsonPayload = JsonComponent.jsonFor(article, jsonResponse:_*)

    remoteRenderArticle(ws, jsonPayload, article)
  }

}
