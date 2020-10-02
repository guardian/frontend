package controllers

import common.EmailSubsciptionMetrics._
import common.{ImplicitControllerExecutionContext, LinkTo, Logging}
import conf.Configuration
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import com.gu.identity.model.{EmailEmbed, EmailNewsletter}
import com.typesafe.scalalogging.LazyLogging
import play.api.data.Forms._
import play.api.data._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints.emailAddress
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc._
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import utils.RemoteAddress

import scala.concurrent.Future
import scala.concurrent.duration._

object emailLandingPage extends StandalonePage {
  private val id = "email-landing-page"
  override val metadata = MetaData.make(id = id, section = None, webTitle = "Email Landing Page")
}

case class EmailForm(
    email: String,
    listName: Option[String],
    referrer: Option[String],
    campaignCode: Option[String],
    name: String,
) {

  // `name` is a hidden (via css) form input
  // if it was set to something this form was likely filled by a bot
  // https://stackoverflow.com/a/34623588/2823715
  def isLikelyBotSubmission: Boolean =
    name match {
      case "" | "undefined" | "null" => false
      case _                         => true
    }
}

class EmailFormService(wsClient: WSClient) extends LazyLogging with RemoteAddress {

  def submit(form: EmailForm)(implicit request: Request[AnyContent]): Future[WSResponse] =
    if (form.isLikelyBotSubmission) {
      Future.failed(new IllegalAccessException("Form was likely submitted by a bot."))
    } else {
      val idAccessClientToken = Configuration.id.apiClientToken
      val consentMailerUrl = s"${Configuration.id.apiRoot}/consent-email"
      val consentMailerPayload = JsObject(Json.obj("email" -> form.email, "set-lists" -> List(form.listName)).fields)
      val headers = clientIp(request)
        .map(ip => List("X-Forwarded-For" -> ip))
        .getOrElse(List.empty) :+ "X-GU-ID-Client-Access-Token" -> s"Bearer $idAccessClientToken"

      //FIXME: this should go via the identity api client / app
      wsClient
        .url(consentMailerUrl)
        .addHttpHeaders(headers: _*)
        .post(consentMailerPayload)
    }
}

class EmailSignupController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    csrfCheck: CSRFCheck,
    csrfAddToken: CSRFAddToken,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with Logging {
  val emailFormService = new EmailFormService(wsClient)

  val emailForm: Form[EmailForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listName" -> optional[String](of[String]),
      "referrer" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String]),
      "name" -> text,
    )(EmailForm.apply)(EmailForm.unapply),
  )

  def renderPage(): Action[AnyContent] =
    Action { implicit request =>
      Cached(60)(RevalidatableResult.Ok(views.html.emailLanding(emailLandingPage)))
    }

  def renderFooterForm(listName: String): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val id = EmailNewsletter.fromIdentityName(listName).map(_.listIdV1)
        id match {
          case Some(_) =>
            Cached(1.day)(RevalidatableResult.Ok(views.html.emailFragmentFooter(emailLandingPage, listName)))
          case _ => Cached(15.minute)(WithoutRevalidationResult(NoContent))
        }
      }
    }

  def renderForm(emailType: String, listId: Int): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = EmailNewsletter(listId)
          .orElse(EmailNewsletter.fromV1ListId(listId))

        identityNewsletter match {
          case Some(newsletter) =>
            Cached(1.day)(RevalidatableResult.Ok(views.html.emailFragment(
              emailLandingPage,
              emailType,
              newsletter.identityName,
              newsletter.emailEmbed
            )))
          case _ => Cached(15.minute)(WithoutRevalidationResult(NoContent))
        }
      }
    }

  def renderFormFromName(emailType: String, listName: String): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = EmailNewsletter.fromIdentityName(listName)
        identityNewsletter match {
          case Some(newsletter) =>
            Cached(1.day)(RevalidatableResult.Ok(views.html.emailFragment(
              emailLandingPage,
              emailType,
              newsletter.identityName,
              newsletter.emailEmbed
            )))
          case _ => Cached(15.minute)(WithoutRevalidationResult(NoContent))
        }
      }
    }

  def subscriptionResult(result: String, listName: String): Action[AnyContent] =
    Action { implicit request =>
      listName match {
        case "footer" => {
          Cached(7.days)(result match {
            case "success" => RevalidatableResult.Ok(views.html.emailSubscriptionResultFooter(emailLandingPage, Subscribed))
            case "invalid" => RevalidatableResult.Ok(views.html.emailSubscriptionResultFooter(emailLandingPage, InvalidEmail))
            case "error" => RevalidatableResult.Ok(views.html.emailSubscriptionResultFooter(emailLandingPage, OtherError))
            case _ => WithoutRevalidationResult(NotFound)
          })
        }
        case listName: String => {
          val identityNewsletter = EmailNewsletter.fromIdentityName(listName)
          identityNewsletter match {
            case Some(newsletter) =>
              Cached (7.days) (result match {
                case "success" => RevalidatableResult.Ok (
                  views.html.emailSubscriptionResultV2(emailLandingPage, Subscribed, newsletter.emailEmbed)
                )
                case "invalid" => RevalidatableResult.Ok (
                  views.html.emailSubscriptionResultV2(emailLandingPage, InvalidEmail, newsletter.emailEmbed)
                )
                case "error" => RevalidatableResult.Ok (
                  views.html.emailSubscriptionResultV2(emailLandingPage, OtherError, newsletter.emailEmbed)
                )
                case _ => WithoutRevalidationResult(NotFound)
              })
            case _ => Cached(15.minute)(WithoutRevalidationResult(NoContent))
          }
        }
      }
    }

  def submit(listName: String): Action[AnyContent] =
    Action.async { implicit request =>
      AllEmailSubmission.increment()

      def respond(result: SubscriptionResult): Result = {
        render {
          case Accepts.Html() =>
            result match {
              case Subscribed   => SeeOther(LinkTo(s"/email/success/$listName"))
              case InvalidEmail => SeeOther(LinkTo(s"/email/invalid/$listName"))
              case OtherError   => SeeOther(LinkTo(s"/email/error/$listName"))
            }

          case Accepts.Json() =>
            Cors(NoCache(result match {
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
          Future.successful(respond(InvalidEmail))
        },
        form => {
          log.info(
            s"Post request received to /email/${listName} - " +
              s"email: ${form.email}, " +
              s"referer: ${request.headers.get("referer").getOrElse("unknown")}, " +
              s"user-agent: ${request.headers.get("user-agent").getOrElse("unknown")}, " +
              s"x-requested-with: ${request.headers.get("x-requested-with").getOrElse("unknown")}",
          )
          emailFormService
            .submit(form)
            .map(_.status match {
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
          }
        },
      )
    }

  def options(): Action[AnyContent] =
    Action { implicit request =>
      TinyResponse.noContent(Some("GET, POST, OPTIONS"))
    }
}
