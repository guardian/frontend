package controllers

import com.typesafe.scalalogging.LazyLogging
import common.EmailSubsciptionMetrics._
import common.{GuLogging, ImplicitControllerExecutionContext, LinkTo}
import conf.Configuration
import conf.switches.Switches.{EmailSignupRecaptcha, ValidateEmailSignupRecaptchaTokens}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.data.Forms._
import play.api.data._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints.emailAddress
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc._
import play.filters.csrf.CSRFAddToken
import services.newsletters.{GoogleRecaptchaValidationService, GoogleResponse, NewsletterSignupAgent}
import utils.RemoteAddress
import conf.switches.Switches.NewslettersRemoveConfirmationStep

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
    ref: Option[String],
    refViewId: Option[String],
    campaignCode: Option[String],
    googleRecaptchaResponse: Option[String],
    name: String,
    emailConfirmation: Boolean,
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

  def submit(form: EmailForm)(implicit request: Request[AnyContent]): Future[WSResponse] = {
    if (form.isLikelyBotSubmission) {
      Future.failed(new IllegalAccessException("Form was likely submitted by a bot."))
    } else {
      val idAccessClientToken = Configuration.id.apiClientToken
      val consentMailerUrl = serviceUrl(form)
      val consentMailerPayload = JsObject(Json.obj("email" -> form.email, "set-lists" -> List(form.listName)).fields)
      val headers = clientIp(request)
        .map(ip => List("X-Forwarded-For" -> ip))
        .getOrElse(List.empty) :+ "X-GU-ID-Client-Access-Token" -> s"Bearer $idAccessClientToken"

      val queryStringParameters = form.ref.map("ref" -> _).toList ++
        form.refViewId.map("refViewId" -> _).toList ++
        form.listName.map("listName" -> _).toList

      //FIXME: this should go via the identity api client / app
      wsClient
        .url(consentMailerUrl)
        .withQueryStringParameters(queryStringParameters: _*)
        .addHttpHeaders(headers: _*)
        .post(consentMailerPayload)
    }
  }

  private def serviceUrl(form: EmailForm): String = {
    if (NewslettersRemoveConfirmationStep.isSwitchedOn && !form.emailConfirmation){
      return s"${Configuration.id.apiRoot}/consent-signup"
    }
    s"${Configuration.id.apiRoot}/consent-email"
  }
}

class EmailSignupController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
    csrfAddToken: CSRFAddToken,
    emailEmbedAgent: NewsletterSignupAgent,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {
  val emailFormService = new EmailFormService(wsClient)
  val googleRecaptchaTokenValidationService = new GoogleRecaptchaValidationService(wsClient)

  val emailForm: Form[EmailForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listName" -> optional[String](of[String]),
      "referrer" -> optional[String](of[String]),
      "ref" -> optional[String](of[String]),
      "refViewId" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String]),
      "g-recaptcha-response" -> optional[String](of[String]),
      "name" -> text,
      "emailConfirmation" -> boolean,
    )(EmailForm.apply)(EmailForm.unapply),
  )

  def logApiError(error: String): Unit = {
    log.error(s"API call to get newsletters failed: $error")
  }

  def logNewsletterNotFoundError(newsletterName: String): Unit = {
    log.error(s"Newsletter not found: Couldn't find $newsletterName")
  }

  def renderPage(): Action[AnyContent] =
    Action { implicit request =>
      Cached(60)(RevalidatableResult.Ok(views.html.emailLanding(emailLandingPage)))
    }

  def renderFooterForm(listName: String): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = emailEmbedAgent.getNewsletterByName(listName)
        identityNewsletter match {
          case Right(Some(newsletter)) =>
            if (EmailSignupRecaptcha.isSwitchedOn && newsletter.signupPage.isDefined) {
              Cached(1.day)(
                RevalidatableResult
                  .Ok(views.html.linkToEmailSignupPage(emailLandingPage, newsletter.signupPage.get, newsletter.name)),
              )
            } else {
              Cached(1.day)(RevalidatableResult.Ok(views.html.emailFragmentFooter(emailLandingPage, listName)))
            }
          case Right(None) =>
            logNewsletterNotFoundError(listName)
            Cached(15.minute)(WithoutRevalidationResult(NoContent))
          case Left(e) =>
            logApiError(e)
            Cached(15.minute)(WithoutRevalidationResult(InternalServerError))
        }
      }
    }

  def renderForm(emailType: String, listId: Int): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = emailEmbedAgent.getNewsletterById(listId)

        identityNewsletter match {
          case Right(Some(newsletter)) =>
            Cached(1.hour)(
              RevalidatableResult.Ok(
                views.html.emailFragment(
                  emailLandingPage,
                  emailType,
                  newsletter,
                ),
              ),
            )
          case Right(None) =>
            logNewsletterNotFoundError(listId.toString)
            Cached(15.minute)(WithoutRevalidationResult(NoContent))
          case Left(e) =>
            logApiError(e)
            Cached(15.minute)(WithoutRevalidationResult(InternalServerError))
        }
      }
    }

  def renderFormFromName(emailType: String, listName: String): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = emailEmbedAgent.getNewsletterByName(listName)
        identityNewsletter match {
          case Right(Some(newsletter)) =>
            Cached(1.hour)(
              RevalidatableResult.Ok(
                views.html.emailFragment(
                  emailLandingPage,
                  emailType,
                  newsletter,
                ),
              ),
            )
          case Right(None) =>
            logNewsletterNotFoundError(listName)
            Cached(15.minute)(WithoutRevalidationResult(NoContent))
          case Left(e) =>
            logApiError(e)
            Cached(15.minute)(WithoutRevalidationResult(InternalServerError))
        }
      }
    }

  def subscriptionResultFooter(result: String): Action[AnyContent] =
    Action { implicit request =>
      Cached(1.hour)(result match {
        case "success" =>
          RevalidatableResult.Ok(views.html.emailSubscriptionResultFooter(emailLandingPage, Subscribed))
        case "invalid" =>
          RevalidatableResult.Ok(views.html.emailSubscriptionResultFooter(emailLandingPage, InvalidEmail))
        case "error" =>
          RevalidatableResult.Ok(views.html.emailSubscriptionResultFooter(emailLandingPage, OtherError))
        case _ => WithoutRevalidationResult(NoContent)
      })
    }

  def subscriptionSuccessResult(listName: String): Action[AnyContent] =
    Action { implicit request =>
      val identityNewsletter = emailEmbedAgent.getNewsletterByName(listName)
      identityNewsletter match {
        case Right(Some(newsletter)) =>
          Cached(1.hour)(
            RevalidatableResult.Ok(
              views.html.emailSubscriptionSuccessResult(emailLandingPage, newsletter, listName),
            ),
          )
        case Right(None) =>
          logNewsletterNotFoundError(listName)
          Cached(15.minute)(WithoutRevalidationResult(NoContent))
        case Left(e) =>
          logApiError(e)
          Cached(15.minute)(WithoutRevalidationResult(InternalServerError))
      }
    }

  def subscriptionNonsuccessResult(result: String): Action[AnyContent] =
    Action { implicit request =>
      Cached(1.hour)(result match {
        case "invalid" =>
          RevalidatableResult.Ok(
            views.html.emailSubscriptionNonsuccessResult(emailLandingPage, InvalidEmail),
          )
        case "error" =>
          RevalidatableResult.Ok(
            views.html.emailSubscriptionNonsuccessResult(emailLandingPage, OtherError),
          )
        case _ => WithoutRevalidationResult(NoContent)
      })
    }

  def submitFooter(): Action[AnyContent] =
    Action.async { implicit request =>
      AllEmailSubmission.increment()

      emailForm.bindFromRequest.fold(
        formWithErrors => {
          log.info(s"Form has been submitted with errors: ${formWithErrors.errors}")
          EmailFormError.increment()
          Future.successful(respondFooter(InvalidEmail))
        },
        form => {
          log.info(
            s"Post request received to /email/ - " +
              s"email: ${form.email}, " +
              s"ref: ${form.ref}, " +
              s"refViewId: ${form.refViewId}, " +
              s"g-recaptcha-response: ${form.googleRecaptchaResponse}, " +
              s"referer: ${request.headers.get("referer").getOrElse("unknown")}, " +
              s"user-agent: ${request.headers.get("user-agent").getOrElse("unknown")}, " +
              s"x-requested-with: ${request.headers.get("x-requested-with").getOrElse("unknown")}",
          )

          (for {
            _ <- validateCaptcha(form, ValidateEmailSignupRecaptchaTokens.isSwitchedOn)
            result <- submitFormFooter(form)
          } yield {
            result
          }) recover {
            case _ =>
              respondFooter(OtherError)
          }
        },
      )
    }

  def submit(): Action[AnyContent] =
    Action.async { implicit request =>
      AllEmailSubmission.increment()

      emailForm.bindFromRequest.fold(
        formWithErrors => {
          log.info(s"Form has been submitted with errors: ${formWithErrors.errors}")
          EmailFormError.increment()
          Future.successful(respond(InvalidEmail))
        },
        form => {
          log.info(
            s"Post request received to /email/ - " +
              s"email: ${form.email}, " +
              s"ref: ${form.ref}, " +
              s"refViewId: ${form.refViewId}, " +
              s"g-recaptcha-response: ${form.googleRecaptchaResponse}, " +
              s"referer: ${request.headers.get("referer").getOrElse("unknown")}, " +
              s"user-agent: ${request.headers.get("user-agent").getOrElse("unknown")}, " +
              s"x-requested-with: ${request.headers.get("x-requested-with").getOrElse("unknown")}",
          )

          (for {
            _ <- validateCaptcha(form, ValidateEmailSignupRecaptchaTokens.isSwitchedOn)
            result <- submitForm(form)
          } yield {
            result
          }) recover {
            case _ =>
              respond(OtherError)
          }
        },
      )
    }

  def options(): Action[AnyContent] =
    Action { implicit request =>
      TinyResponse.noContent(Some("GET, POST, OPTIONS"))
    }

  private def respond(result: SubscriptionResult, listName: Option[String] = None)(implicit
      request: Request[AnyContent],
  ): Result = {
    render {
      case Accepts.Html() =>
        result match {
          case Subscribed   => SeeOther(LinkTo(s"/email/success/${listName.get}"))
          case InvalidEmail => SeeOther(LinkTo(s"/email/invalid"))
          case OtherError   => SeeOther(LinkTo(s"/email/error"))
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

  private def respondFooter(result: SubscriptionResult)(implicit
      request: Request[AnyContent],
  ): Result = {
    render {
      case Accepts.Html() =>
        result match {
          case Subscribed   => SeeOther(LinkTo(s"/email/success/footer"))
          case InvalidEmail => SeeOther(LinkTo(s"/email/invalid/footer"))
          case OtherError   => SeeOther(LinkTo(s"/email/error/footer"))
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

  private def submitForm(form: EmailForm)(implicit request: Request[AnyContent]) = {
    emailFormService
      .submit(form)
      .map(_.status match {
        case 200 | 201 =>
          EmailSubmission.increment()
          respond(Subscribed, form.listName)

        case status =>
          log.error(s"Error posting to Identity API: HTTP $status")
          APIHTTPError.increment()
          respond(OtherError)

      }) recover {
      case _: IllegalAccessException =>
        respond(Subscribed, form.listName)
      case e: Exception =>
        log.error(s"Error posting to Identity API: ${e.getMessage}")
        APINetworkError.increment()
        respond(OtherError)
    }
  }

  private def submitFormFooter(form: EmailForm)(implicit request: Request[AnyContent]) = {
    emailFormService
      .submit(form)
      .map(_.status match {
        case 200 | 201 =>
          EmailSubmission.increment()
          respondFooter(Subscribed)

        case status =>
          log.error(s"Error posting to Identity API: HTTP $status")
          APIHTTPError.increment()
          respondFooter(OtherError)

      }) recover {
      case _: IllegalAccessException =>
        respondFooter(Subscribed)
      case e: Exception =>
        log.error(s"Error posting to Identity API: ${e.getMessage}")
        APINetworkError.increment()
        respondFooter(OtherError)
    }
  }

  private def validateCaptcha(form: EmailForm, shouldValidateCaptcha: Boolean)(implicit
      request: Request[AnyContent],
  ) = {
    if (shouldValidateCaptcha) {
      for {
        token <- form.googleRecaptchaResponse match {
          case Some(token) => Future.successful(token)
          case None =>
            RecaptchaMissingTokenError.increment()
            Future.failed(new IllegalAccessException("reCAPTCHA client token not provided"))
        }
        wsResponse <- googleRecaptchaTokenValidationService.submit(token) recoverWith {
          case e =>
            RecaptchaAPIUnavailableError.increment()
            Future.failed(e)
        }
        googleResponse = wsResponse.json.as[GoogleResponse]
        _ <- {
          if (googleResponse.success) {
            RecaptchaValidationSuccess.increment()
            Future.successful(())
          } else {
            RecaptchaValidationError.increment()
            val errorMessage = s"Google token validation failed with error: ${googleResponse.`error-codes`}"
            Future.failed(new IllegalAccessException(errorMessage))
          }
        }
      } yield ()
    } else {
      Future.successful(())
    }
  }
}
