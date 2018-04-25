package controllers

import common._
import conf.Configuration
import model._
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc._
import java.net.URLEncoder

import scala.concurrent._

class CampaignsController(
  val controllerComponents: ControllerComponents,
  wsClient: WSClient,
)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with Logging {

  private val root = Configuration.formstack.url + "/form/"
  private val endpoint = "/submission.json"
  private val token = Configuration.formstack.editorialOauthToken

  def makeUrlSafe(formId: String): String = URLEncoder.encode(formId, "UTF-8")

  def formSubmit() = Action.async { implicit request =>

    val pageUrl: String = request.headers("referer")
    val jsonBody: Option[JsValue] = request.body.asJson


    jsonBody.map { json =>
      val formId: String = makeUrlSafe((json \ "formId").as[String])

        sendToFormstack(json, formId).flatMap { res =>
          if (res.status == 201) {
            Future.successful(Redirect(pageUrl))
          }
          else {
            log.error(s"Reader contribution to callout was sent to Formstack but not saved correctly: ${res}")
            Future(BadRequest("Sorry your story couldn't be saved"))
          }
        }
    }.getOrElse{
      log.error(s"Reader contribution callout: No data submitted by the reader - post body was empty: ${jsonBody}")
      Future(BadRequest("Sorry no data was found"))
    }

  }

  private def sendToFormstack(data: JsValue, formId: String): Future[WSResponse] = {
    wsClient.url(root + formId + endpoint).withHttpHeaders(
      "Authorization" -> s"Bearer $token",
      "Accept" -> "application/json",
      "Content-Type" -> "application/json"
    ).post(data)
  }
}


