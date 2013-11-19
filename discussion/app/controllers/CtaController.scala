package controllers

import play.api.mvc.{SimpleResult, AnyContent, Action}
import play.api.libs.json.{JsValue, Json}
import common.{JsonComponent, Logging}
import model.Cached
import discussion.model.Comment

import scala.concurrent.{ExecutionContext, Future}
import play.api.libs.ws.{WS, Response}
import java.lang.System._
import common.DiscussionMetrics.DiscussionHttpTimingMetric
import ExecutionContext.Implicits.global

trait CtaController extends DiscussionController {

  val openCtaApi = new OpenCtaApi {}

  def cta(): Action[AnyContent] = Action.async {

    implicit request =>
        openCtaApi.getTopComment map {
        ctaJson => {
          Cached(60) {
            JsonComponent("html" -> views.html.fragments.commentCta(Comment(ctaJson)))
          }
        }
      }
  }

}

trait OpenCtaApi extends Logging {

  def onError(r: Response) =
    s"Error loading callToAction, status: ${r.status}, message: ${r.statusText}, response: ${r.body}"


  def getTopComment(): Future[JsValue] = {
    getJsonOrError("url to open cta", onError) map {
      json =>   ((json \\ "components")(0) \\ "comments")(0)(0)
    }
  }

  protected def getJsonOrError(url: String, onError: (Response) => String, headers: (String, String)*): Future[JsValue] = {
    val start = currentTimeMillis()
    GET(url) map {
      response =>
        DiscussionHttpTimingMetric.recordTimeSpent(currentTimeMillis - start)

        response.status match {
          case 200 =>
            Json.parse(response.body)

          case _ =>
            log.error(onError(response))
            throw new RuntimeException("Error from OpenCTA API, " + onError(response))
        }
    }
  }

  protected def GET(url: String): Future[Response] =
    WS.url(url).withRequestTimeout(2000).get() // TODO: make this a property. --IKenna
}