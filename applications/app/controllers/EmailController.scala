package controllers

import common.ExecutionContexts
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

object emailLandingPage extends MetaData {
  lazy val id: String = "email-landing-page"
  lazy val section: String = ""
  lazy val analyticsName: String = id
  lazy val webTitle: String = "Email Landing Page"
}

case class EmailPage (interactive: Interactive, related: RelatedContent)

case class EmailForm(email: String)

object EmailForm {
  val postUrl = "https://l2y0m1o3nk.execute-api.eu-west-1.amazonaws.com/code/email"
  val listTriggers = Map(
    3485 -> 2529
  )

  def submit(form: EmailForm, listId: Int): Option[Future[WSResponse]] = {
    listTriggers.get(listId).map { triggerId =>
      WS.url(postUrl).post(Json.obj(
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

  def submit() = Action.async { implicit request =>
    val listId = 3485

    emailForm.bindFromRequest.fold(
      formWithErrors => {
        val result = FailedToSubscribe("Invalid email address")

        Future(render {
          case Accepts.Html() => BadRequest(views.html.emailLanding(emailLandingPage, Some(result)))
          case Accepts.Json() => BadRequest(result.message)
        })
      },

      form => EmailForm.submit(form, listId) match {
        case Some(future) => future.map(_.status match {
          case 200 | 201 => render {
            case Accepts.Html() => Created(views.html.emailLanding(emailLandingPage, Some(Subscribed)))
            case Accepts.Json() => Created(Json.obj("email" -> form.email))
          }

          case _ => {
            val result = FailedToSubscribe("Something bad happened")

            render {
              case Accepts.Html() => InternalServerError(views.html.emailLanding(emailLandingPage, Some(result)))
              case Accepts.Json() => InternalServerError(result.message)
            }
          }
        })

        case _ => {
          val result = FailedToSubscribe("Unable to find listId")

          Future(render {
            case Accepts.Html() => InternalServerError(views.html.emailLanding(emailLandingPage, Some(result)))
            case Accepts.Json() => InternalServerError(result.message)
          })
        }
      })
  }
}

