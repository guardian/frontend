package controllers

import common.ExecutionContexts
import model._
import play.api.Play.current
import play.api.data._
import play.api.data.Forms._
import play.api.libs.ws.WS
import play.api.libs.json._
import play.api.mvc.{Action, Controller, RequestHeader, Result}
import model.MetaData

import scala.concurrent.Future

class emailLandingPage() extends MetaData {
  lazy val id: String = "email-landing-page"
  lazy val section: String = ""
  lazy val analyticsName: String = id
  lazy val webTitle: String = "Email Landing Page"
}

case class EmailPage (interactive: Interactive, related: RelatedContent)

case class EmailSubmission(email: String)

object EmailController extends Controller with ExecutionContexts {
  val listId  = 12345
  val postUrl = "https://3b1d4pkpvi.execute-api.eu-west-1.amazonaws.com/dev/email"

  def renderPage() = Action { implicit request =>
    val emailLandingHtml = views.html.emailLanding(new emailLandingPage())
    Ok(emailLandingHtml)
  }

  def submit() = Action.async { implicit request =>
    val form = Form(
      mapping(
        "email" -> nonEmptyText
      )(EmailSubmission.apply)(EmailSubmission.unapply)
    )

    form.bindFromRequest.fold(
      err => Future(Ok(s"$err")),

      form => {
        val json = Json.obj(
          "email"  -> form.email,
          "listId" -> listId
        )

        WS.url(postUrl).post(json).map(res => res.status match {
          case 200 => Ok(s"OK: $res")
          case _   => InternalServerError(s"${res.json}")
        })
      }
    )
  }
}
