package controllers

import common._
import conf.Configuration
import model._
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc._

import scala.concurrent._

class CampaignsController(
  val controllerComponents: ControllerComponents,
  wsClient: WSClient,
)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with Logging {

  private val endpoint = Configuration.journalism.calloutsUrl

  def formSubmit(): Action[AnyContent] = Action.async { implicit request =>

    val pageUrl: String = request.headers("referer")
    val jsonBody: Option[JsValue] = request.body.asJson

    jsonBody.map { json =>
      sendToFormstack(json).map { res =>
        if (res.status == 201) {
          Redirect(pageUrl)
        }
        else {
          log.error(s"Reader contribution to callout was sent to Formstack but not saved correctly: ${res}")
          InternalServerError("There was a problem processing your request, please try again later.")
        }
      }
    }.getOrElse{
      log.error(s"Reader contribution callout: No data submitted by the reader - post body was empty: ${jsonBody}")
      Future.successful(BadRequest("No data was sent in the request"))
    }

  }

  private def sendToFormstack(data: JsValue): Future[WSResponse] = {
    wsClient.url(endpoint).withHttpHeaders(
      "Accept" -> "application/json",
      "Content-Type" -> "application/json"
    ).post(data)
  }
}


