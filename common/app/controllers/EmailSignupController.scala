package controllers

import common.EmailSubsciptionMetrics._
import common.{ImplicitControllerExecutionContext, LinkTo, Logging}
import conf.Configuration
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import com.gu.identity.model.EmailNewsletters
import play.api.data.Forms._
import play.api.data._
import play.api.data.format.Formats.stringFormat
import play.api.data.validation.Constraints.emailAddress
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.duration._

object emailLandingPage extends StandalonePage {
  private val id = "email-landing-page"
  override val metadata = MetaData.make(
    id = id,
    section = None,
    webTitle = "Email Landing Page")
}

case class EmailForm(
  email: String,
  listId: Int,
  referrer: Option[String],
  campaignCode: Option[String])

class EmailFormService(wsClient: WSClient) {

  val testListId = 3485
  val testListTrigger = 2529

  /**
    * Associate lists with triggered send keys in ExactTarget. In our case these have a 1:1 relationship.
    */
  val listIdsWithTrigger: Map[Int, Int] = (for {
    list <- EmailNewsletters.all.subscriptions
    id <- list.allIds
    triggerId <- list.triggerId
  } yield id -> triggerId).toMap.updated(testListId, testListTrigger)

  def submit(form: EmailForm): Future[WSResponse] = {
    val maybeTriggeredSendKey: Option[Int] = listIdsWithTrigger.get(form.listId)

    wsClient.url(Configuration.emailSignup.url).post(
      JsObject(Json.obj(
      "email" -> form.email,
      "listId" -> form.listId,
      "triggeredSendKey" -> maybeTriggeredSendKey,
      "emailGroup" -> "email-footer-test",
      "referrer" -> form.referrer,
      "campaignCode" -> form.campaignCode)
      .fields
      .filterNot{ case (_, v) => v == JsNull}))
  }
}

class EmailSignupController(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController with ImplicitControllerExecutionContext with Logging {
    val emailFormService = new EmailFormService(wsClient)
  val emailForm: Form[EmailForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listId" -> number,
      "referrer" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String])
    )(EmailForm.apply)(EmailForm.unapply)
  )

  def renderPage(): Action[AnyContent] = Action { implicit request =>
    Cached(60)(RevalidatableResult.Ok(views.html.emailLanding(emailLandingPage)))
  }

  def renderForm(emailType: String, listId: Int): Action[AnyContent] = Action { implicit request =>
    Cached(1.day)(RevalidatableResult.Ok(views.html.emailFragment(emailLandingPage, emailType, listId)))}

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
