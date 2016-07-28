package model.deploys

import conf.Configuration
import ApiResults.{ApiError, ApiErrors, ApiResponse}
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.ws.WSClient

import scala.concurrent.Future
import scala.language.postfixOps
import scala.concurrent.ExecutionContext.Implicits.global

case class Commit(sha: String, username: String, message: String)
object Commit {
  implicit val w = Json.writes[Commit]
  implicit val r: Reads[Commit] = (
    (__ \ "version").read[String] and
      (__ \ "username").read[String] and
      (__ \ "comment").read[String]
    )(Commit.apply _)
}
case class TeamCityBuild(number: String,
                         id: Int,
                         status: String,
                         projectName: String,
                         parentNumber: Option[String],
                         revision: String,
                         commits: List[Commit]) {

  val isSuccess = (status == "SUCCESS")
  def committers() = commits.map(_.username).distinct
  def link = s"${Configuration.teamcity.host}/viewLog.html?buildId=${id}"
}

object TeamCityBuild {
  implicit val w = Json.writes[TeamCityBuild]
  implicit val r: Reads[TeamCityBuild] = (
    (__ \ "number").read[String] and
      (__ \ "id").read[Int] and
      (__ \ "status").read[String] and
      (__ \ "buildType").read(
        (__ \ "projectName").read[String] and
          (__ \ "name").read[String]
          tupled
      ).map{case (project, name) => project + ":" + name} and
      (__ \ "artifact-dependencies" \ "build").read(
        (__ \\ "number").readNullable[String]
      ) and
      (__ \ "revisions" \ "revision" \\ "version").read[String] and
      (__ \ "changes" \ "change").read[List[Commit]]
    )(TeamCityBuild.apply _)
}

class TeamcityService(httpClient: HttpLike) {

  def getTeamCityBuild(number: String): Future[ApiResponse[TeamCityBuild]] = {
    val apiPath = "/guestAuth/app/rest"
    val url = s"${Configuration.teamcity.internalHost}${apiPath}/builds/number:$number,state:any,canceled(any)"

    httpClient.GET(url,
      queryString = Map("fields" -> List(
        "id", "number", "buildType(name,projectName)", "status",
        "revisions(revision(version))", "changes(change(username,comment,version))",
        "artifact-dependencies(build(number))").mkString(",")),
      headers = Map("Accept" -> "application/json")
    ).map { response =>
      response.status match {
        case 200 => response.json.validate[TeamCityBuild] match {
          case JsSuccess(build, _) => Right(build)
          case JsError(error) => Left(ApiErrors(List(ApiError("Invalid JSON from Teamcity API", 500))))
        }
        case statusCode => Left(ApiErrors(List(ApiError(s"Invalid status code from TeamCity: $statusCode", 500))))
      }
    }
  }

}
