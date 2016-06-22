package controllers.admin

import common.Logging
import conf.Configuration
import implicits.Requests
import model.deploys.{NotifyRequestBody, NotifyTypes, ApiKeyAuthenticationSupport, ApiResults}
import ApiResults.{ApiErrors, ApiError, ApiResponse}
import model.deploys._
import play.api.libs.json.{JsError, JsSuccess}
import play.api.mvc.{Request, Controller}
import play.api.mvc.BodyParsers.parse.{json => BodyJson}
import scala.concurrent.Future
import scala.concurrent.Future.sequence
import scala.concurrent.ExecutionContext.Implicits.global

trait DeploysNotifyController extends Controller with ApiKeyAuthenticationSupport with Logging with Requests {

  val apiKey: String

  override def validApiKey(key: String): Boolean = {
    key == apiKey
  }

  val riffRaff: RiffRaffService
  val teamcity: TeamcityService

  private def allNotices(build: TeamCityBuild, request: Request[NotifyRequestBody]): ApiResponse[List[Notice]] = {
    request.body.notices.map { notice =>
      notice.`type` match {
        case NotifyTypes.Slack =>
          notice.data.validate[SlackNoticeData] match {
            case JsSuccess(d, _) => Right(SlackNotice(build, d.hookUrl, d.channel, d.username))
            case JsError(error) => Left(ApiError("Cannot validate Slack notice data", 400))
          }
        case _ => Left(ApiError("Unknown Notify type", 400))
      }
    }.partition(_.isLeft) match { // transforming a List of Eithers in a Either of Lists
      case (Nil, notify) => Right(for(Right(i) <- notify) yield i)
      case (errors, _) => Left(ApiErrors(for(Left(s) <- errors) yield s))
    }
  }


  private def notifyAll(step : NoticeStep, notices: List[Notice]): Future[ApiResponse[List[NoticeResponse]]] = {
    val sendResponses = notices.map { notify =>
      sendNotice(step, notify)
    }
    sequence(sendResponses).map {
      response => Right(response) //We only reports the response as is for now
    }
  }

  // Used in test to override requests to 3rd parties
  protected def sendNotice(step: NoticeStep, notice: Notice): Future[NoticeResponse] = {
    notice.send(step)
  }

  //
  // Routes
  //

  def notifyStep(number: String) = ApiKeyAuthenticatedAction.async(BodyJson[NotifyRequestBody]) { implicit request =>
    teamcity.getTeamCityBuild(number).flatMap { teamcityBuild =>
      val notices = for {
        build <- teamcityBuild.right
        ns <- allNotices(build, request).right
      } yield ns
      notices match {
        case Right(ns) => notifyAll(request.body.step, ns).map(ApiResults(_))
        case Left(errors) => Future.successful(ApiResults(notices))
      }
    }
  }

}

class DeploysNotifyControllerImpl extends DeploysNotifyController {
  override val apiKey = Configuration.DeploysNotify.apiKey.getOrElse(
    throw new RuntimeException("Deploys-notify API Key not set")
  )
  override val riffRaff = RiffRaffService
  override val teamcity = TeamcityService
}

