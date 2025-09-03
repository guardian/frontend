package controllers

import com.typesafe.scalalogging.LazyLogging
import common.EmailSubsciptionMetrics._
import common.{GuLogging, ImplicitControllerExecutionContext, LinkTo}
import conf.Configuration
import conf.switches.Switches.{
  EmailSignupRecaptcha,
  NewslettersRemoveConfirmationStep,
  ValidateEmailSignupRecaptchaTokens,
}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.data.Forms._
import play.api.data._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints.{emailAddress, nonEmpty}
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc._
import play.filters.csrf.CSRFAddToken
import services.newsletters.{GoogleRecaptchaValidationService, GoogleResponse, NewsletterSignupAgent}
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
    marketing: Option[String],
    referrer: Option[String],
    ref: Option[String],
    refViewId: Option[String],
    campaignCode: Option[String],
    googleRecaptchaResponse: Option[String],
    name: Option[String],
) {}

case class EmailFormManyNewsletters(
    email: String,
    listNames: Seq[String],
    marketing: Option[Boolean],
    referrer: Option[String],
    ref: Option[String],
    refViewId: Option[String],
    campaignCode: Option[String],
    googleRecaptchaResponse: Option[String],
    name: Option[String],
) {}

class EmailFormService(wsClient: WSClient, emailEmbedAgent: NewsletterSignupAgent)
    extends LazyLogging
    with RemoteAddress {

  def submit(form: EmailForm)(implicit request: Request[AnyContent]): Future[WSResponse] = {
    val consentMailerUrl = serviceUrl(form, emailEmbedAgent)
    val consentMailerPayload = JsObject(
      Json
        .obj(
          "email" -> form.email,
          "set-lists" -> List(form.listName),
          "set-consents" -> form.marketing.map(_ => List("similar_guardian_products")),
        )
        .fields,
    )

    val queryStringParameters = form.ref.map("ref" -> _).toList ++
      form.refViewId.map("refViewId" -> _).toList ++
      form.listName.map("listName" -> _).toList

    // FIXME: this should go via the identity api client / app
    wsClient
      .url(consentMailerUrl)
      .withQueryStringParameters(queryStringParameters: _*)
      .addHttpHeaders(getHeaders(request): _*)
      .post(consentMailerPayload)
  }

  def submitWithMany(form: EmailFormManyNewsletters)(implicit request: Request[AnyContent]): Future[WSResponse] = {
    val consentMailerPayload = JsObject(
      Json
        .obj(
          "email" -> form.email,
          "set-lists" -> form.listNames,
          "refViewId" -> form.refViewId,
          "ref" -> form.ref,
          "set-consents" -> form.marketing.filter(_ == true).map(_ => List("similar_guardian_products")),
          "unset-consents" -> form.marketing.filter(_ == false).map(_ => List("similar_guardian_products")),
        )
        .fields,
    )

    val queryStringParameters = form.ref.map("ref" -> _).toList ++
      form.refViewId.map("refViewId" -> _).toList ++
      form.listNames.map("listName" -> _).toList

    wsClient
      .url(s"${Configuration.id.apiRoot}/consent-email")
      .withQueryStringParameters(queryStringParameters: _*)
      .addHttpHeaders(getHeaders(request): _*)
      .post(consentMailerPayload)
  }

  private def serviceUrl(form: EmailForm, emailEmbedAgent: NewsletterSignupAgent): String = {
    val identityNewsletter = emailEmbedAgent.getV2NewsletterByName(form.listName.get)
    val newsletterRequireConfirmation = identityNewsletter.map(_.get.emailConfirmation).getOrElse(true)

    if (NewslettersRemoveConfirmationStep.isSwitchedOn && !newsletterRequireConfirmation) {
      s"${Configuration.id.apiRoot}/consent-signup"
    } else {
      s"${Configuration.id.apiRoot}/consent-email"
    }
  }

  private def getHeaders(request: Request[AnyContent]): List[(String, String)] = {
    val idAccessClientToken = Configuration.id.apiClientToken

    clientIp(request)
      .map(ip => List("X-Forwarded-For" -> ip))
      .getOrElse(List.empty) :+ "X-GU-ID-Client-Access-Token" -> s"Bearer $idAccessClientToken"
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
  val emailFormService = new EmailFormService(wsClient, emailEmbedAgent)
  val googleRecaptchaTokenValidationService = new GoogleRecaptchaValidationService(wsClient)

  val emailForm: Form[EmailForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listName" -> optional[String](of[String]),
      "marketing" -> optional[String](of[String]),
      "referrer" -> optional[String](of[String]),
      "ref" -> optional[String](of[String]),
      "refViewId" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String]),
      "g-recaptcha-response" -> optional[String](of[String]),
      "name" -> optional[String](of[String]),
    )(EmailForm.apply)(EmailForm.unapply),
  )

  val emailFormManyNewsletters: Form[EmailFormManyNewsletters] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listNames" -> seq(of[String]),
      "marketing" -> optional[Boolean](of[Boolean]),
      "referrer" -> optional[String](of[String]),
      "ref" -> optional[String](of[String]),
      "refViewId" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String]),
      "g-recaptcha-response" -> optional[String](of[String]),
      "name" -> optional[String](of[String]),
    )(EmailFormManyNewsletters.apply)(EmailFormManyNewsletters.unapply),
  )

  def renderFooterForm(listName: String): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = emailEmbedAgent.getV2NewsletterByName(listName)
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

  def renderThrasherForm(listId: Int): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = emailEmbedAgent.getV2NewsletterById(listId)

        identityNewsletter match {
          case Right(Some(newsletter)) =>
            Cached(1.hour)(
              RevalidatableResult.Ok(
                views.html.emailFragmentThrasher(
                  emailLandingPage,
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

  def renderThrasherFormFromName(listName: String): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = emailEmbedAgent.getV2NewsletterByName(listName)

        identityNewsletter match {
          case Right(Some(newsletter)) =>
            Cached(1.hour)(
              RevalidatableResult.Ok(
                views.html.emailFragmentThrasher(
                  emailLandingPage,
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

  def renderFormWithParentComponent(emailType: String, listId: Int, parentComponent: String): Action[AnyContent] =
    renderForm(emailType, listId, Option(parentComponent))

  def renderForm(emailType: String, listId: Int, iframeParentComponent: Option[String] = None): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = emailEmbedAgent.getV2NewsletterById(listId)

        identityNewsletter match {
          case Right(Some(newsletter)) =>
            Cached(1.hour)(
              RevalidatableResult.Ok(
                views.html.emailFragment(
                  emailLandingPage,
                  emailType,
                  newsletter,
                  iframeParentComponent,
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

  def logApiError(error: String)(implicit request: RequestHeader): Unit = {
    logErrorWithRequestId(s"API call to get newsletters failed: $error")
  }

  def logNewsletterNotFoundError(newsletterName: String)(implicit request: RequestHeader): Unit = {
    logInfoWithRequestId(
      s"The newsletter $newsletterName used in an email sign-up form could not be found by the NewsletterSignupAgent. It may no longer exist or $newsletterName may be an outdated reference number.",
    )
  }

  def renderFormFromNameWithParentComponent(
      emailType: String,
      listName: String,
      parentComponent: String,
  ): Action[AnyContent] =
    renderFormFromName(emailType, listName, Option(parentComponent))

  def renderFormFromName(
      emailType: String,
      listName: String,
      iframeParentComponent: Option[String] = None,
  ): Action[AnyContent] =
    csrfAddToken {
      Action { implicit request =>
        val identityNewsletter = emailEmbedAgent.getV2NewsletterByName(listName)
        identityNewsletter match {
          case Right(Some(newsletter)) =>
            Cached(1.hour)(
              RevalidatableResult.Ok(
                views.html.emailFragment(
                  emailLandingPage,
                  emailType,
                  newsletter,
                  iframeParentComponent,
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
      val identityNewsletter = emailEmbedAgent.getV2NewsletterByName(listName)
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

      emailForm
        .bindFromRequest()
        .fold(
          formWithErrors => {
            logInfoWithRequestId(s"Form has been submitted with errors: ${formWithErrors.errors}")
            EmailFormError.increment()
            Future.successful(respondFooter(InvalidEmail))
          },
          form => {
            logInfoWithRequestId(
              s"Post request received to /email/ - " +
                s"ref: ${form.ref}, " +
                s"refViewId: ${form.refViewId}, " +
                s"referer: ${request.headers.get("referer").getOrElse("unknown")}, " +
                s"user-agent: ${request.headers.get("user-agent").getOrElse("unknown")}, " +
                s"x-requested-with: ${request.headers.get("x-requested-with").getOrElse("unknown")}",
            )

            (for {
              _ <- validateCaptcha(form.googleRecaptchaResponse, ValidateEmailSignupRecaptchaTokens.isSwitchedOn)
              result <- submitFormFooter(form)
            } yield {
              result
            }) recover { case _ =>
              respondFooter(OtherError)
            }
          },
        )
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

  private def submitFormFooter(form: EmailForm)(implicit request: Request[AnyContent]) = {
    emailFormService
      .submit(form)
      .map(_.status match {
        case 200 | 201 =>
          EmailSubmission.increment()
          respondFooter(Subscribed)

        case status =>
          logErrorWithRequestId(s"Error posting to Identity API: HTTP $status")
          APIHTTPError.increment()
          respondFooter(OtherError)

      }) recover {
      case _: IllegalAccessException =>
        respondFooter(Subscribed)
      case e: Exception =>
        logErrorWithRequestId(s"Error posting to Identity API: ${e.getMessage}")
        APINetworkError.increment()
        respondFooter(OtherError)
    }
  }

  private def validateCaptcha(googleRecaptchaResponse: Option[String], shouldValidateCaptcha: Boolean)(implicit
      request: Request[AnyContent],
  ) = {
    if (shouldValidateCaptcha) {
      for {
        token <- googleRecaptchaResponse match {
          case Some(token) => Future.successful(token)
          case None =>
            RecaptchaMissingTokenError.increment()
            Future.failed(new IllegalAccessException("reCAPTCHA client token not provided"))
        }
        wsResponse <- googleRecaptchaTokenValidationService.submit(token) recoverWith { case e =>
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

  def submit(): Action[AnyContent] =
    Action.async { implicit request =>
      AllEmailSubmission.increment()

      emailForm
        .bindFromRequest()
        .fold(
          formWithErrors => {
            logInfoWithRequestId(s"Form has been submitted with errors: ${formWithErrors.errors}")
            EmailFormError.increment()
            Future.successful(respond(InvalidEmail))
          },
          form => {
            logInfoWithRequestId(
              s"Post request received to /email/ - " +
                s"ref: ${form.ref}, " +
                s"refViewId: ${form.refViewId}, " +
                s"referer: ${request.headers.get("referer").getOrElse("unknown")}, " +
                s"user-agent: ${request.headers.get("user-agent").getOrElse("unknown")}, " +
                s"x-requested-with: ${request.headers.get("x-requested-with").getOrElse("unknown")}",
            )

            (for {
              _ <- validateCaptcha(form.googleRecaptchaResponse, ValidateEmailSignupRecaptchaTokens.isSwitchedOn)
              result <- buildSubmissionResult(emailFormService.submit(form), form.listName)
            } yield {
              result
            }) recover { case _ =>
              respond(OtherError)
            }
          },
        )
    }

  def submitMany(): Action[AnyContent] =
    Action.async { implicit request =>
      AllEmailSubmission.increment()

      emailFormManyNewsletters
        .bindFromRequest()
        .fold(
          formWithErrors => {
            logInfoWithRequestId(s"Form has been submitted with errors: ${formWithErrors.errors}")
            EmailFormError.increment()
            Future.successful(respond(InvalidEmail))
          },
          form => {
            logInfoWithRequestId(
              s"Post request received to /email/many/ - " +
                s"listNames.size: ${form.listNames.size.toString()}, " +
                s"ref: ${form.ref}, " +
                s"refViewId: ${form.refViewId}, " +
                s"referer: ${request.headers.get("referer").getOrElse("unknown")}, " +
                s"user-agent: ${request.headers.get("user-agent").getOrElse("unknown")}, " +
                s"x-requested-with: ${request.headers.get("x-requested-with").getOrElse("unknown")}",
            )

            (for {
              _ <- validateCaptcha(form.googleRecaptchaResponse, ValidateEmailSignupRecaptchaTokens.isSwitchedOn)
              result <- buildSubmissionResult(emailFormService.submitWithMany(form), Option.empty[String])
            } yield {
              result
            }) recover { case _ =>
              respond(OtherError)
            }
          },
        )
    }

  private def buildSubmissionResult(wsResponse: Future[WSResponse], listName: Option[String])(implicit
      request: Request[AnyContent],
  ) = {
    wsResponse.map(_.status match {
      case 200 | 201 =>
        EmailSubmission.increment()
        respond(Subscribed, listName)

      case status =>
        logErrorWithRequestId(s"Error posting to Identity API: HTTP $status")
        APIHTTPError.increment()
        respond(OtherError)

    }) recover {
      case _: IllegalAccessException =>
        respond(Subscribed)
      case e: Exception =>
        logErrorWithRequestId(s"Error posting to Identity API: ${e.getMessage}")
        APINetworkError.increment()
        respond(OtherError)
    }
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

  def options(): Action[AnyContent] =
    Action { implicit request =>
      TinyResponse.noContent(Some("GET, POST, OPTIONS"))
    }
}
