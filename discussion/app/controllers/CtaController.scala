package controllers

import discussion.util.Http
import play.api.libs.json.JsValue
import play.api.libs.ws.WSResponse
import play.api.mvc.{Controller, Action}
import model.Cached
import common.{ExecutionContexts, JsonComponent}
import discussion.model.{Discussion, DiscussionKey, Comment}
import conf.Configuration
import scala.concurrent.Future

object CtaController extends Controller with ExecutionContexts with Http with implicits.Requests {
  private lazy val ctaApiRoot: String = Configuration.open.ctaApiRoot

  private def getTopComments(key: DiscussionKey): Future[List[Comment]] = {
    def onError(r: WSResponse) = s"Error loading CallToAction, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"

    getJsonOrError(s"$ctaApiRoot/cta/article/${key.keyAsString}", onError).map { json: JsValue =>
      for {
        component <- (json \ "components").as[List[JsValue]]
        comment <- (component \ "comments").as[List[JsValue]]
      } yield Comment(comment, None, Some(Discussion.empty))
    }
  }

  def cta(key: DiscussionKey) = Action.async { implicit request =>
    getTopComments(key).map { comments: List[Comment] =>
      Cached(60)(JsonComponent("html" -> views.html.fragments.ctaTopComments(comments, true)))
    } recover {
      case _ => Cached(900)(JsonComponent("html" -> views.html.fragments.ctaTopComments(Nil, false)))
    }
  }
}
