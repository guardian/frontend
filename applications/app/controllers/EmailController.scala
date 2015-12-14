package controllers

import common.{LinkTo, Logging, ExecutionContexts}
import conf.Configuration
import model._
import play.api.Play.current
import play.api.data._
import play.api.data.validation.Constraints.emailAddress
import play.api.data.Forms._
import play.api.libs.ws.{WSResponse, WS}
import play.api.libs.json._
import play.api.mvc.Results._
import play.api.data.format.Formats.stringFormat
import play.api.mvc.{Result, Action, Controller}
import metrics.EmailSubsciptionMetrics._

import scala.concurrent.Future
import scala.concurrent.duration._

object emailLandingPage extends StandalonePage {
  private val id = "email-landing-page"
  override val metadata = MetaData.make(
    id = id,
    section = "",
    analyticsName = id,
    webTitle = "Email Landing Page")
}

case class EmailForm(
  email: String,
  listId: Int,
  referrer: Option[String],
  campaignCode: Option[String])

object ListIds {
  val testList = 3485
  val guardianTodayUk = 37
  val guardianTodayUs = 1493
  val guardianTodayAu = 1506
}

object EmailTypes {
  val footer = "footer"
  val article = "article"
  val landing = "landing"
}

object EmailForm {
  /**
    * Associate lists with triggered send keys in ExactTarget. In our case these have a 1:1 relationship.
    */
  val listTriggers = Map(
    ListIds.testList -> 2529,
    ListIds.guardianTodayUk -> 2529,
    ListIds.guardianTodayUs -> 2564,
    ListIds.guardianTodayAu -> 2563
  )

  def submit(form: EmailForm): Option[Future[WSResponse]] = {
    listTriggers.get(form.listId).map { triggeredSendKey =>
      WS.url(Configuration.emailSignup.url).post(Json.obj(
        "email" -> form.email,
        "listId" -> form.listId,
        "triggeredSendKey" -> triggeredSendKey,
        "emailGroup" -> "email-footer-test"
      ))
    }
  }
}

object EmailController extends Controller with ExecutionContexts with Logging {
  val emailForm: Form[EmailForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listId" -> number,
      "referrer" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String])
    )(EmailForm.apply)(EmailForm.unapply)
  )

  def renderPage() = Action { implicit request =>
    Cached(60)(Ok(views.html.emailLanding(emailLandingPage)))
  }

  def renderForm(emailType: String, listId: Int) = Action { implicit request =>
    Cached(60)(Ok(views.html.emailFragment(emailLandingPage, emailType, listId)))
  }

  def subscriptionResult(result: String) = Action { implicit request =>
    Cached(7.days)(result match {
      case "success" => Ok(views.html.emailSubscriptionResult(emailLandingPage, Subscribed))
      case "invalid" => Ok(views.html.emailSubscriptionResult(emailLandingPage, InvalidEmail))
      case "error"   => Ok(views.html.emailSubscriptionResult(emailLandingPage, OtherError))
      case _         => NotFound
    })
  }

  def submit() = Action.async { implicit request =>
    AllEmailSubmission.increment()

    def respond(result: SubscriptionResult): Result = {
      render {
        case Accepts.Html() => result match {
          case Subscribed   => SeeOther(LinkTo("/email/success"))
          case InvalidEmail => SeeOther(LinkTo("/email/invalid"))
          case OtherError   => SeeOther(LinkTo("/email/error"))
        }

        case Accepts.Json() => Cors(NoCache(result match {
          case Subscribed   => Created("Subscribed")
          case InvalidEmail => BadRequest("Invalid email")
          case OtherError   => InternalServerError("Internal error")
        }))
        case _ =>
          NotAccepted.increment()
          NotAcceptable
      }
    }

    emailForm.bindFromRequest.fold(
      formWithErrors => {
        log.error(s"FormErrors: ${formWithErrors.errors}")
        EmailFormError.increment()
        Future.successful(respond(InvalidEmail))},

      form => EmailForm.submit(form) match {
        case Some(future) => future.map(_.status match {
          case 200 | 201 =>
            EmailSubmission.increment()
            respond(Subscribed)

          case status    =>
            log.error(s"Error posting to ExactTarget: HTTP $status")
            APIHTTPError.increment()
            respond(OtherError)

        }) recover {
          case e: Exception =>
            log.error(s"Error posting to ExactTarget: ${e.getMessage}")
            APINetworkError.increment()
            respond(OtherError)
        }

        case None =>
          log.error(s"Unable to find a trigger for list ID ${form.listId}")
          ListIDError.increment()
          Future.successful(respond(OtherError))
      })
  }

  def options() = Action { implicit request =>
    TinyResponse.noContent(Some("GET, POST, OPTIONS"))
  }
}
