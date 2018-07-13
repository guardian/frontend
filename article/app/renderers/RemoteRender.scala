package renderers

import common.JsonComponent
import conf.Configuration
import controllers.ArticlePage
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, ContentFields, PageWithStoryPackage}
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}

import scala.concurrent.{ExecutionContext, Future}
import play.twirl.api.Html

import scala.concurrent.duration._
import common.RichRequestHeader

import ExecutionContext.Implicits.global

class RemoteRender(implicit context: ApplicationContext) {

  private def remoteRenderArticle(ws:WSClient, payload: String): Future[String] = ws.url(Configuration.rendering.renderingEndpoint)
    .withRequestTimeout(2000.millis)
    .addHttpHeaders("Content-Type" -> "application/json")
    .post(payload)
    .map((response) =>
      response.body
    )

  def render(ws:WSClient, path: String, model: PageWithStoryPackage)(implicit request: RequestHeader): Future[Result] = model match {

    case article : ArticlePage =>
      val contentFieldsJson = if (request.isGuui) List("contentFields" -> Json.toJson(ContentFields(article.article))) else List()
      val jsonResponse = List(("html", views.html.fragments.articleBody(article))) ++ contentFieldsJson
      val jsonPayload = JsonComponent.jsonFor(model, jsonResponse:_*)

      remoteRenderArticle(ws, jsonPayload).map(s => {
        Cached(article){ RevalidatableResult.Ok(Html(s)) }
      })

    case _ => throw new Exception("Remote render not supported for this content type")

  }

}
