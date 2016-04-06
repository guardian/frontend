package model.deploys

import java.net.URI
import model.deploys.NoticeSteps.{DeployFinishedProd, DeployFinishedCode, BuildStarted, BuildFinished}
import play.api.libs.json._
import play.api.libs.ws.WS
import scala.util.{Failure, Success, Try}
import scala.concurrent.Future
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._

sealed trait NoticeStep
object NoticeSteps {
  case object BuildStarted extends NoticeStep
  case object BuildFinished extends NoticeStep
  case object DeployFinishedProd extends NoticeStep
  case object DeployFinishedCode extends NoticeStep
}

object NoticeStep {
  def fromString(s: String): Option[NoticeStep] = PartialFunction.condOpt(s) {
    case "build-started" => NoticeSteps.BuildStarted
    case "build-finished" => NoticeSteps.BuildFinished
    case "deploy-finished-code" => NoticeSteps.DeployFinishedCode
    case "deploy-finished-prod" => NoticeSteps.DeployFinishedProd
  }
  implicit val r = new Reads[NoticeStep] {
    def reads(json: JsValue): JsResult[NoticeStep] = json match {
      case JsString(s) => fromString(s).map{JsSuccess(_)}.getOrElse(JsError(s"$s is not a valid Notify step"))
      case _ => JsError("Notify step could not be decoded")
    }
  }
}

case class NoticeResponse(notice: Notice, response: String)
object NoticeResponse {
  implicit val w = new Writes[NoticeResponse] {
    def writes(resp: NoticeResponse): JsValue = {
      Json.obj(
        "description" -> resp.notice.desc,
        "response" -> resp.response
      )
    }
  }
}

abstract class Notice(build: TeamCityBuild) {
  def send(step: NoticeStep): Future[NoticeResponse]
  val desc: String
}
object Notice {
  implicit val w = new Writes[Notice] {
    def writes(n: Notice): JsValue = {
      Json.obj("description" -> n.desc)
    }
  }
}

/*
 Slack Notice
 */

case class SlackNotice(build: TeamCityBuild,
                       hookUrl: URI,
                       channel: Option[String] = None,
                       username: Option[String] = None) extends Notice(build) {

  val defaultChannel = "#dotcom-push"
  val defaultUsername = "Radiator"

  val color = if(build.isSuccess) "good" else "danger"
  val statusIcon = if(build.isSuccess) ":white_check_mark:" else ":x:"
  val whoIsIn = s"Who is in? ${build.committers.mkString(", ")}"
  val buildLink = s"<${build.link}|build #${build.number}>"

  override val desc = s"Slack notification: ${hookUrl}"

  override def send(step: NoticeStep) = {
    WS.url(hookUrl.toString)
      .withHeaders("Content-Type" -> "application/json")
      .withRequestTimeout(5000)
      .post(jsonBodyForStep(step))
      .map { response =>
        NoticeResponse(this, response.body)
      }
      .recover {
        case e => NoticeResponse(this, e.getMessage)
      }
  }

  def jsonBodyBasics(): JsObject = {
    Json.obj(
    "channel" -> JsString(channel.getOrElse(defaultChannel)),
    "username" -> JsString(username.getOrElse(defaultUsername))
    )
  }

  def jsonBodyForStep(step: NoticeStep): JsObject = {
    val json = step match {
      case BuildStarted =>
          Json.obj(
            "text" -> s"${buildLink} STARTED (${whoIsIn})"
          )
      case BuildFinished =>
          Json.obj(
            "attachments" -> Seq(
              Json.obj(
                "fallback" -> JsString(s"[${build.projectName}] ${buildLink} ${statusIcon} ${build.status} ($whoIsIn)"),
                "title" -> JsString(s"[${build.projectName}] build #${build.number} ${build.status}"),
                "color" -> JsString(color),
                "title_link" -> JsString(build.link),
                "text" -> JsString(whoIsIn)
              )
            )
          )
      case DeployFinishedCode =>
          Json.obj(
            "text" -> s"${buildLink} was deployed to <http://m.code.dev-theguardian.com|CODE> (${whoIsIn})"
          )
      case DeployFinishedProd =>
          Json.obj(
            "text" -> s"${buildLink} was deployed to <http://www.theguardian.com|PROD> (${whoIsIn})"
          )
    }
    jsonBodyBasics ++ json
  }

}

case class SlackNoticeData(hookUrl: URI, channel: Option[String], username: Option[String])
object SlackNoticeData {

  // URI serializer/deserializer
  implicit val uf = new Format[URI] {
    override def writes(uri: URI): JsValue = JsString(uri.toString)
    override def reads(json: JsValue): JsResult[URI] = {
      val error = JsError("Value is expected to convert to URI")
      json match {
        case JsString(s) =>
          Try(URI.create(s)) match {
            case Success(uri) => JsSuccess(uri)
            case Failure(_) => error
          }
        case _ => error
      }
    }
  }

  implicit val r = Json.format[SlackNoticeData]
}


