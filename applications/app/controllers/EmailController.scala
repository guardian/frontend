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

  val theBestOfCiF = 2313
  val theFiver = 218
  val mediaBriefing = 217
  val greenLight = 28
  val povertyMatters = 113
  val theLongRead = 3322
  val morningMail = 2636
  val australianPolitics = 1866

  val theBreakdown = 219
  val theSpin = 220

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

  val all: List[Int] = List(
    theBestOfCiF,
    theFiver,
    mediaBriefing,
    greenLight,
    povertyMatters,
    theLongRead,
    morningMail,
    australianPolitics,
    theBreakdown,
    theSpin,
    sleeveNotes,
    closeUp,
    filmToday,
    bookmarks,
    artWeekly,
    zipFile,
    theFlyer,
    moneyTalks,
    fashionStatement,
    crosswordEditorUpdate,
    theObserverFoodMonthly,
    firstDogOnTheMoon,
    bestOfOpinionAUS,
    bestOfOpinionUS,
    theGuardianMasterclasses,
    theGuardianGardener,
    theGuardianBookshop)
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
  val listIdsWithMaybeTrigger: Map[Int, Option[Int]] = Map(
    ListIds.testList -> Some(2529),
    ListIds.guardianTodayUk -> Some(2529),
    ListIds.guardianTodayUs -> Some(2564),
    ListIds.guardianTodayAu -> Some(2563)) ++ controllers.ListIds.all.map(_ -> None).toMap

  def submit(form: EmailForm): Option[Future[WSResponse]] = {
    listIdsWithMaybeTrigger.get(form.listId).flatten.map { triggeredSendKey: Int =>
      WS.url(Configuration.emailSignup.url).post(
        JsObject(Json.obj(
        "email" -> form.email,
        "listId" -> form.listId,
        "triggeredSendKey" -> triggeredSendKey,
        "emailGroup" -> "email-footer-test",
        "referrer" -> form.referrer,
        "campaignCode" -> form.campaignCode)
        .fields
        .filterNot{ case (_, v) => v == JsNull}))
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
