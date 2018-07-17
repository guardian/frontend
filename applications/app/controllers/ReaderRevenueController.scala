package controllers

import com.gu.googleauth.UserIdentity
import common.{ImplicitControllerExecutionContext, Logging}
import model._
import play.api.mvc._
import services.S3

import scala.concurrent.duration._
import conf.Configuration.readerRevenue._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import play.api.libs.json._
import org.joda.time.DateTime

import scala.util.Try

class ReaderRevenueController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with ImplicitControllerExecutionContext with Logging {

  import ReaderRevenueController._

  private def getContributionsBannerDeployLog(): Option[String] = {
    S3.get(contributionsBannerDeployLogKey)
  }

  private def putContributionsBannerDeployLog(bannerDeployLogJson: String): Unit = {
    val defaultJsonEncoding: String = "application/json;charset=utf-8"
    S3.putPublic(contributionsBannerDeployLogKey, bannerDeployLogJson, defaultJsonEncoding)
  }

  private def parseDeployLog(log: String): Option[DeployLog] = {
    for {
      json <- Try(Json.parse(log)).toOption
      log <- json.validate[DeployLog].asOpt
    } yield log
  }

  private def bannerDeployLogUnavailable(implicit request: RequestHeader) = {
    log.warn(s"Could not get reader revenue contributions-banner deploy log from s3")
    Cached(300)(WithoutRevalidationResult(NotFound))
  }

  private def createLog(time: DateTime, user: String): JsValue = {
    val deployLog = ( for {
      json <- getContributionsBannerDeployLog()
      log <- parseDeployLog(json)
    } yield log.update(time, user)).getOrElse(DeployLog.init(time, user))

    Json.toJson(deployLog)
  }

  def contributionsBannerDeployLog(): Action[AnyContent] = Action { implicit request =>
    getContributionsBannerDeployLog.fold(bannerDeployLogUnavailable){ bannerDeployLog =>
      Cached(7.days) {
        RevalidatableResult.Ok(bannerDeployLog)
      }
    }
  }

  def redeployContributionsBanner(): Action[AnyContent] = Action { implicit request =>
    val requester: String = UserIdentity.fromRequest(request) map(_.fullName) getOrElse "unknown user (dev-build?)"
    val time = DateTime.now
    putContributionsBannerDeployLog(createLog(time, requester))
    NoCache(Ok(createLog(time, requester)))
   }
}

object ReaderRevenueController {
  private implicit val jodaDateTimeFormats: Format[DateTime] =
    Format(JodaReads.jodaDateReads("yyyy-MM-dd'T'HH:mm:ssZ"), JodaWrites.jodaDateWrites("yyyy-MM-dd'T'HH:mm:ssZ"))

  case class Deploy(time: DateTime, user: String)
  object Deploy {
    implicit val deployFormat: OFormat[Deploy] = Json.format[Deploy]
  }

  case class DeployLog(lastDeploy: DateTime, deployHistory: List[Deploy]) {
    def update(time: DateTime, user: String): DeployLog = DeployLog(time, Deploy(time, user) :: deployHistory)
  }
  object DeployLog {
    implicit val deployLogFormat: OFormat[DeployLog] = Json.format[DeployLog]

    def init(time: DateTime, user: String): DeployLog = DeployLog(time, List(Deploy(time, user)))
  }

}
