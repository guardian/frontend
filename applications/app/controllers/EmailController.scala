package controllers

import common.ExecutionContexts
import model._
import play.api.Play.current
import play.api.data._
import play.api.data.validation.Constraints.emailAddress
import play.api.data.Forms._
import play.api.libs.ws.WS
import play.api.libs.json._
import play.api.mvc.{Action, Controller}
import model.MetaData

import scala.concurrent.Future

object emailLandingPage extends MetaData {
  lazy val id: String = "email-landing-page"
  lazy val section: String = ""
  lazy val analyticsName: String = id
  lazy val webTitle: String = "Email Landing Page"
}

case class EmailPage (interactive: Interactive, related: RelatedContent)

case class EmailForm(email: String)

object EmailForm {
  val postUrl = "https://3b1d4pkpvi.execute-api.eu-west-1.amazonaws.com/dev/email"
  val listId  = 12345

  def submit(form: EmailForm) = {
    WS.url(postUrl).post(Json.obj(
      "email"  -> form.email,
      "listId" -> listId
    ))
  }
}

object EmailController extends Controller with ExecutionContexts {

  val emailForm: Form[EmailForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress)
    )(EmailForm.apply)(EmailForm.unapply)
  )

  def renderPage() = Action { implicit request =>
    Ok(views.html.emailLanding(emailLandingPage))
  }

  def submit() = Action.async { implicit request =>
    emailForm.bindFromRequest.fold(
      formWithErrors => Future(InternalServerError("Invalid email address")),

      form => EmailForm.submit(form).map(res => res.status match {
        case 200 => Ok(s"OK: $res")
        case _   => InternalServerError(s"${res.json}")
      })
    )
  }
}
