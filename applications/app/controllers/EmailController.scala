package controllers

import common.ExecutionContexts
import conf.Configuration
import model._
import play.api.Play.current
import play.api.data._
import play.api.data.validation.Constraints.emailAddress
import play.api.data.Forms._
import play.api.libs.ws.{WSResponse, WS}
import play.api.libs.json._
import play.api.mvc.{Result, Action, Controller}
import model.MetaData

import scala.concurrent.Future
import scala.concurrent.duration._

object emailLandingPage extends MetaData {
  lazy val id: String = "email-landing-page"
  lazy val section: String = ""
  lazy val analyticsName: String = id
  lazy val webTitle: String = "Email Landing Page"
}

case class EmailPage(interactive: Interactive, related: RelatedContent)

case class EmailForm(email: String)

object EmailForm {
  val listTriggers = Map(
    3485 -> 2529
  )

  def submit(form: EmailForm, listId: Int): Option[Future[WSResponse]] = {
    listTriggers.get(listId).map { triggerId =>
      WS.url(Configuration.emailSignup.url).post(Json.obj(
        "email" -> form.email,
        "listId" -> listId,
        "triggerId" -> triggerId
      ))
    }
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

  def renderForm() = Action { implicit request =>
    Ok(views.html.emailFragment(emailLandingPage))
  }

  def subscriptionResult(result: String) = Action { implicit request =>
    Cached(7.days)(result match {
      case "success" => Ok(views.html.emailLanding(emailLandingPage, Some(Subscribed)))
      case "invalid" => Ok(views.html.emailLanding(emailLandingPage, Some(InvalidEmail)))
      case "error"   => Ok(views.html.emailLanding(emailLandingPage, Some(OtherError)))
      case _         => NotFound
    })
  }

  def submit() = Action.async { implicit request =>
    val listId = 3485

    def respond(result: SubscriptionResult): Result = {
      render {
        case Accepts.Html() => result match {
          case Subscribed   => SeeOther("/email/success")
          case InvalidEmail => SeeOther("/email/invalid")
          case OtherError   => SeeOther("/email/error")
        }

        case Accepts.Json() => result match {
          case Subscribed   => Created("Subscribed")
          case InvalidEmail => BadRequest("Invalid email")
          case OtherError   => InternalServerError("Internal error")
        }
      }
    }

    emailForm.bindFromRequest.fold(
      formWithErrors => Future.successful(respond(InvalidEmail)),

      form => EmailForm.submit(form, listId) match {
        case Some(future) => future.map(_.status match {
          case 200 | 201 => respond(Subscribed)
          case _         => respond(OtherError)
        }) recover {
          case _ => respond(OtherError)
        }

        case None => Future.successful(respond(OtherError))
      })
  }
}
