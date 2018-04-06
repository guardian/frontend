package controllers

import common.EmailSubsciptionMetrics._
import common.{ImplicitControllerExecutionContext, LinkTo, Logging}
import conf.Configuration
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import com.gu.identity.model.{EmailNewsletter, EmailNewsletters}
import com.typesafe.scalalogging.LazyLogging
import play.api.data.Forms._
import play.api.data._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints.emailAddress
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc._
import play.filters.csrf.{CSRFAddToken, CSRFCheck}

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

object emailLandingPage extends StandalonePage {
  private val id = "email-landing-page"
  override val metadata = MetaData.make(
    id = id,
    section = None,
    webTitle = "Email Landing Page")
}

case class EmailForm(
  email: String,
  listName: Option[String],
  referrer: Option[String],
  campaignCode: Option[String],
  name: Option[String]) {

  // `name` is a hidden (via css) form input
  // if it was set to something this form was likely filled by a bot
  // https://stackoverflow.com/a/34623588/2823715
  def isLikelyBotSubmission: Boolean = name.map(_.trim) match {
    case Some("") | Some(null) | Some("undefined") | None | Some("null") => false
    case _ => true
  }

}

class EmailFormService(wsClient: WSClient) extends LazyLogging {

  def submit(form: EmailForm): Future[WSResponse] = if (form.isLikelyBotSubmission) {
    Future.failed(new IllegalAccessException("Form was likely submitted by a bot."))
  } else {
    val idAccessClientToken = Configuration.id.apiClientToken
    val consentMailerUrl = s"${Configuration.id.apiRoot}/consent-email"
    val consentMailerPayload = JsObject(Json.obj("email" -> form.email, "set-lists" -> List(form.listName)).fields)

    wsClient
      .url(consentMailerUrl)
      .addHttpHeaders("X-GU-ID-Client-Access-Token" -> s"Bearer $idAccessClientToken")
      .post(consentMailerPayload)
  }
}

class EmailSignupController(wsClient: WSClient, val controllerComponents: ControllerComponents, csrfCheck: CSRFCheck, csrfAddToken: CSRFAddToken)(implicit context: ApplicationContext) extends BaseController with ImplicitControllerExecutionContext with Logging {
  val emailFormService = new EmailFormService(wsClient)

  val emailForm: Form[EmailForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listName" -> optional[String](of[String]),
      "referrer" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String]),
      "name" -> optional(text)
    )(EmailForm.apply)(EmailForm.unapply)
  )

  def renderPage(): Action[AnyContent] = Action { implicit request =>
    Cached(60)(RevalidatableResult.Ok(views.html.emailLanding(emailLandingPage)))
  }

  def renderForm(emailType: String, listId: Int): Action[AnyContent] = csrfAddToken {
    Action { implicit request =>
      val identityName = EmailNewsletter(listId)
        .orElse(EmailNewsletter.fromV1ListId(listId))
        .map(_.identityName)

      identityName match {
        case Some(listName) => Cached(1.day)(RevalidatableResult.Ok(views.html.emailFragment(emailLandingPage, emailType, listName)))
        case _ => Cached(15.minute)(WithoutRevalidationResult(NotFound))
      }
    }
  }

  def renderFormFromName(emailType: String, listName: String): Action[AnyContent] = csrfAddToken {
    Action { implicit request =>
      val id = EmailNewsletter.fromIdentityName(listName).map(_.listIdV1)
      id match {
        case Some(listId) => Cached(1.day)(RevalidatableResult.Ok(views.html.emailFragment(emailLandingPage, emailType, listName)))
        case _            => Cached(15.minute)(WithoutRevalidationResult(NotFound))
      }
    }
  }


  def subscriptionResult(result: String): Action[AnyContent] = Action { implicit request =>
    Cached(7.days)(result match {
      case "success" => RevalidatableResult.Ok(views.html.emailSubscriptionResult(emailLandingPage, Subscribed))
      case "invalid" => RevalidatableResult.Ok(views.html.emailSubscriptionResult(emailLandingPage, InvalidEmail))
      case "error" => RevalidatableResult.Ok(views.html.emailSubscriptionResult(emailLandingPage, OtherError))
      case _ => WithoutRevalidationResult(NotFound)
    })

  }

  def submit(): Action[AnyContent] = Action.async { implicit request =>
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
        log.info(s"Form has been submitted with errors: ${formWithErrors.errors}")
        EmailFormError.increment()
        Future.successful(respond(InvalidEmail))},

      form => emailFormService.submit(form).map(_.status match {
        case 200 | 201 =>
          EmailSubmission.increment()
          respond(Subscribed)

        case status =>
          log.error(s"Error posting to ExactTarget: HTTP $status")
          APIHTTPError.increment()
          respond(OtherError)

      }) recover {
        case _: IllegalAccessException =>
          respond(Subscribed)
        case e: Exception =>
          log.error(s"Error posting to ExactTarget: ${e.getMessage}")
          APINetworkError.increment()
          respond(OtherError)
      })
  }

  def options(): Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("GET, POST, OPTIONS"))
  }
}
