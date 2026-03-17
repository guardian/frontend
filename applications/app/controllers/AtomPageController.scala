package controllers

import conf.Configuration
import contentapi.ContentApiClient
import common._
import model._
import model.content._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import com.gu.contentapi.client.model.v1.ItemResponse
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.duration._
import play.api.data.Form
import play.api.data.Forms._
import play.api.data.format.Formats._
import play.api.data.validation.Constraints._
import play.api.libs.json.{JsNull, JsObject, Json}
import play.api.libs.ws.{WSClient, WSResponse}

class AtomPageController(
    contentApiClient: ContentApiClient,
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  case class AnswersSignupForm(
      email: String,
      listId: Int,
      referrer: Option[String],
      campaignCode: Option[String],
  )

  val answersSignupForm: Form[AnswersSignupForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listId" -> number,
      "referrer" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String]),
    )(AnswersSignupForm.apply)(AnswersSignupForm.unapply),
  )

  object EmailService {
    def submit(form: AnswersSignupForm)(wsClient: WSClient): Future[WSResponse] = {

      wsClient
        .url(Configuration.emailSignup.url)
        .post(
          JsObject(
            Json
              .obj(
                "email" -> form.email,
                "listId" -> form.listId,
                "triggeredSendKey" -> JsNull,
                "emailGroup" -> "readers-questions-answers-test",
                "referrer" -> form.referrer,
                "campaignCode" -> form.campaignCode,
              )
              .fields
              .filterNot { case (_, v) => v == JsNull },
          ),
        )
    }
  }

  def signup(): Action[AnyContent] =
    Action.async { implicit request =>
      answersSignupForm
        .bindFromRequest()
        .fold(
          formWithErrors => {
            logDebugWithRequestId(s"Form has been submitted with errors: ${formWithErrors.errors}")
            Future.successful(Cors(NoCache(BadRequest("Invalid email"))))
          },
          form => {
            EmailService
              .submit(form)(wsClient)
              .map(_.status match {
                case 200 | 201 =>
                  Cors(NoCache(Created("Subscribed")))

                case status =>
                  logErrorWithRequestId(s"Error posting to ExactTarget: HTTP $status")
                  Cors(NoCache(InternalServerError("Internal error")))

              })
              .recover { case e: Exception =>
                logErrorWithRequestId(s"Error posting to ExactTarget: ${e.getMessage}")
                Cors(NoCache(InternalServerError("Internal error")))
              }
          },
        )
    }

  def renderNoJs(atomType: String, id: String): Action[AnyContent] = render(atomType, id, false, false)

  def renderNoJsVerticalScroll(atomType: String, id: String): Action[AnyContent] = render(atomType, id, false, true)

  def render(
      atomType: String,
      id: String,
      isJsEnabled: Boolean,
      hasVerticalScrollbar: Boolean,
  ): Action[AnyContent] =
    Action.async { implicit request =>
      lookup(s"atom/$atomType/$id") map {
        case Right(atom: ChartAtom) =>
          renderAtom(ChartAtomPage(atom, withJavaScript = isJsEnabled, withVerticalScrollbar = hasVerticalScrollbar))
        case Right(atom: GuideAtom) =>
          renderAtom(GuideAtomPage(atom, withJavaScript = isJsEnabled, withVerticalScrollbar = hasVerticalScrollbar))
        case Right(atom: InteractiveAtom) =>
          renderAtom(
            InteractiveAtomPage(atom, withJavaScript = isJsEnabled, withVerticalScrollbar = hasVerticalScrollbar),
          )
        case Right(atom: MediaAtom) =>
          renderAtom(MediaAtomPage(atom, withJavaScript = isJsEnabled, withVerticalScrollbar = hasVerticalScrollbar))
        case Right(atom: ProfileAtom) =>
          renderAtom(ProfileAtomPage(atom, withJavaScript = isJsEnabled, withVerticalScrollbar = hasVerticalScrollbar))
        case Right(atom: QandaAtom) =>
          renderAtom(QandaAtomPage(atom, withJavaScript = isJsEnabled, withVerticalScrollbar = hasVerticalScrollbar))
        case Right(atom: TimelineAtom) =>
          renderAtom(TimelineAtomPage(atom, withJavaScript = isJsEnabled, withVerticalScrollbar = hasVerticalScrollbar))
        case Right(_) =>
          renderOther(NotFound)
        case Left(other) =>
          renderOther(other)
      }
    }

  def options(): Action[AnyContent] =
    Action { implicit request =>
      TinyResponse.noContent(Some("POST, OPTIONS"))
    }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[Result, Atom]] = {
    val edition = Edition(request)
    contentApiClient
      .getResponse(contentApiClient.item(path, edition))
      .map(makeAtom _ andThen { _.toRight(NotFound) })
      .recover(convertApiExceptions)
  }

  def makeAtom(apiAtom: ItemResponse): Option[Atom] = {
    apiAtom.audio.map(atom => AudioAtom.make(atom)) orElse
      apiAtom.chart.map(atom => ChartAtom.make(atom)) orElse
      apiAtom.guide.map(atom => GuideAtom.make(atom)) orElse
      apiAtom.interactive.map(atom => InteractiveAtom.make(atom)) orElse
      apiAtom.media.map(atom => MediaAtom.make(atom = atom)) orElse
      apiAtom.profile.map(atom => ProfileAtom.make(atom)) orElse
      apiAtom.qanda.map(atom => QandaAtom.make(atom)) orElse
      apiAtom.timeline.map(atom => TimelineAtom.make(atom)) orElse
      /*
    apiAtom.quiz.map(atom => Quiz.make(atom))                     orElse
    apiAtom.review.map(atom => RecipeAtom.make(atom))             orElse
    apiAtom.recipe.map(atom => ReviewAtom.make(atom))             orElse
       */
      None
  }

  private def renderOther(result: Result)(implicit request: RequestHeader) =
    result.header.status match {
      case 404 => NoCache(NotFound)
      case 410 => Cached(24.hours)(WithoutRevalidationResult(Gone(views.html.videoEmbedMissing())))
      case _   => result
    }

  private def renderAtom(page: AtomPage)(implicit request: RequestHeader): Result = {
    Cached(600)(RevalidatableResult.Ok(views.html.atomEmbed(page)))
  }
}
