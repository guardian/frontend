package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentatom.thrift.{Atom => ApiAtom}
import play.api.data.format.Formats._
import common._
import conf.Configuration
import model.Cached.RevalidatableResult
import model.{NoCache, _}
import play.api.mvc._

import scala.concurrent.Future
import contentapi.ContentApiClient
import model.content.StoryQuestionsAtom
import play.api.data.Form
import play.api.data.Forms._
import play.api.data.validation.Constraints._
import play.api.libs.json.{JsNull, JsObject, Json}
import play.api.libs.ws.{WSClient, WSResponse}

class StoryQuestionsAtomEmbedController(
  contentApiClient: ContentApiClient,
  wsClient: WSClient
)(
  implicit context: ApplicationContext
)
  extends Controller
  with Logging
  with ExecutionContexts
{

  case class AnswersSignupForm(
                        email: String,
                        listId: Int,
                        referrer: Option[String],
                        campaignCode: Option[String])

  val answersSignupForm: Form[AnswersSignupForm] = Form(
    mapping(
      "email" -> nonEmptyText.verifying(emailAddress),
      "listId" -> number,
      "referrer" -> optional[String](of[String]),
      "campaignCode" -> optional[String](of[String])
    )(AnswersSignupForm.apply)(AnswersSignupForm.unapply)
  )

  object EmailService {
    def submit(form: AnswersSignupForm)(wsClient: WSClient): Future[WSResponse] = {

      wsClient.url(Configuration.emailSignup.url).post(
        JsObject(Json.obj(
          "email" -> form.email,
          "listId" -> form.listId,
          "triggeredSendKey" -> JsNull,
          "emailGroup" -> "readers-questions-answers-test",
          "referrer" -> form.referrer,
          "campaignCode" -> form.campaignCode)
          .fields
          .filterNot{ case (_, v) => v == JsNull}))
    }
  }

  def signup() = Action.async { implicit request =>
    answersSignupForm.bindFromRequest.fold(
      formWithErrors => {
        log.info(s"Form has been submitted with errors: ${formWithErrors.errors}")
        Future.successful(Cors(NoCache(BadRequest("Invalid email"))))
      },

      form => {
        EmailService.submit(form)(wsClient).map(_.status match {
          case 200 | 201 =>
            Cors(NoCache(Created("Subscribed")))

          case status =>
            log.error(s"Error posting to ExactTarget: HTTP $status")
            Cors(NoCache(InternalServerError("Internal error")))

        }).recover {
          case e: Exception =>
            log.error(s"Error posting to ExactTarget: ${e.getMessage}")
            Cors(NoCache(InternalServerError("Internal error")))
        }
      })
  }

  def render(id: String) = Action.async { implicit request =>
    lookup(s"atom/storyquestions/$id") map {
      case Left(model) => renderStoryQuestionsAtom(model)
      case Right(other) => renderOther(other)
    }
  }

  private def make(apiAtom: Option[ApiAtom]): Option[StoryQuestionsAtom] = apiAtom map StoryQuestionsAtom.make _

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)

    val response: Future[ItemResponse] = contentApiClient.getResponse(contentApiClient.item(path, edition))

    val result = response map { response =>
      make(response.storyquestions) match  {
        case Some(x) => Left(x)
        case _ => Right(NotFound)
      }
    }
    result recover convertApiExceptions
  }

  private def renderOther(result: Result)(implicit request: RequestHeader) = result.header.status match {
    case 404 => NoCache(NotFound)
    case _ => result
  }

  private def renderStoryQuestionsAtom(model: StoryQuestionsAtom)(implicit request: RequestHeader): Result = {
    val page = StoryQuestionsAtomEmbedPage(model)
    Cached(600)(RevalidatableResult.Ok(views.html.fragments.atoms.storyQuestionsEmbed(page)))
  }
}
