package controllers

import common.EmailSubsciptionMetrics._
import common.{ExecutionContexts, LinkTo, Logging}
import conf.Configuration
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.data.Forms._
import play.api.data._
import play.api.data.format.Formats.stringFormat
import play.api.data.validation.Constraints.emailAddress
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.{Action, Controller, Result}

import scala.concurrent.Future
import scala.concurrent.duration._
import play.api.Environment

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

object ListIds {
  val testList = 3485
  val guardianTodayUk = 37
  val guardianTodayUs = 1493
  val guardianTodayAu = 1506

  val theBestOfOpinion = 2313
  val theFiver = 218
  val mediaBriefing = 217
  val greenLight = 28
  val povertyMatters = 113
  val theLongRead = 3322
  val weekendReading = 3743
  val morningMail = 2636
  val australianPolitics = 1866

  val theBreakdown = 219
  val theSpin = 220

  val documentaries = 3745
  val sleeveNotes = 39
  val closeUp = 40
  val filmToday = 1950
  val bookmarks = 3039
  val artWeekly = 99

  val zipFile = 1902
  val theFlyer = 2211
  val moneyTalks = 1079
  val fashionStatement = 105
  val crosswordEditorUpdate = 101
  val theObserverFoodMonthly = 248

  val firstDogOnTheMoon = 2635
  val bestOfOpinionAUS = 2976
  val bestOfOpinionUS = 3228

  val theGuardianMasterclasses = 3561
  val theGuardianGardener = 3562
  val theGuardianBookshop = 3563

  val UsElection = 3599

  val morningMailUk = 3640
}

object EmailTypes {
  val footer = "footer"
  val article = "article"
  val landing = "landing"
  val plain = "plain"
  val plaindark = "plaindark"
}

class EmailFormService(wsClient: WSClient) {
  /**
    * Associate lists with triggered send keys in ExactTarget. In our case these have a 1:1 relationship.
    */
  val listIdsWithTrigger: Map[Int, Option[Int]] = Map(
    ListIds.testList -> Some(2529),
    ListIds.guardianTodayUk -> Some(2529),
    ListIds.guardianTodayUs -> Some(2564),
    ListIds.guardianTodayAu -> Some(2563))

  def submit(form: EmailForm): Future[WSResponse] = {
    val maybeTriggeredSendKey: Option[Int] = listIdsWithTrigger.getOrElse(form.listId, None)

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

class EmailSignupController(wsClient: WSClient)(implicit env: Environment) extends Controller with ExecutionContexts with Logging {
  val emailFormService = new EmailFormService(wsClient)
  val emailForm: Form[EmailForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listId" -> number,
      "referrer" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String])
    )(EmailForm.apply)(EmailForm.unapply)
  )

  def renderPage() = Action { implicit request =>
    Cached(60)(RevalidatableResult.Ok(views.html.emailLanding(emailLandingPage)))
  }

  def renderForm(emailType: String, listId: Int) = Action { implicit request =>
    Cached(1.day)(RevalidatableResult.Ok(views.html.emailFragment(emailLandingPage, emailType, listId)))}

  def subscriptionResult(result: String) = Action { implicit request =>
    Cached(7.days)(result match {
      case "success" => RevalidatableResult.Ok(views.html.emailSubscriptionResult(emailLandingPage, Subscribed))
      case "invalid" => RevalidatableResult.Ok(views.html.emailSubscriptionResult(emailLandingPage, InvalidEmail))
      case "error" => RevalidatableResult.Ok(views.html.emailSubscriptionResult(emailLandingPage, OtherError))
      case _ => WithoutRevalidationResult(NotFound)
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

  def options() = Action { implicit request =>
    TinyResponse.noContent(Some("GET, POST, OPTIONS"))
  }
}
