package model.deploys

import conf.Configuration
import ApiResults.{ApiErrors, ApiError, ApiResponse}
import play.api.libs.json._
import play.api.libs.functional.syntax._
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
// TODO: Rename projectName to projectName (dotcom) and buildTypeName (master)
case class TeamCityBuild(number: String,
                         id: Int,
                         status: String,
                         state: String,
                         projectName: String,
                         parentNumber: Option[String],
                         // Revision is sometimes missing on cancelled builds, e.g.
                         // http://teamcity.gu-web.net:8111/guestAuth/app/rest/builds/id:8181
                         revision: Option[String],
                         commits: List[Commit]
) {

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
      (__ \ "state").read[String] and
      (__ \ "buildType").read(
        (__ \ "projectName").read[String] and
          (__ \ "name").read[String]
          tupled
      ).map{case (project, name) => project + ":" + name} and
      (__ \ "artifact-dependencies" \ "build").read(
        (__ \\ "number").readNullable[String]
      ) and
      (__ \ "revisions" \ "revision" \\ "version").readNullable[String] and
      (__ \ "changes" \ "change").read[List[Commit]]
    )(TeamCityBuild.apply _)
}

trait TeamcityService {

  val httpClient: HttpClient

  val apiPath = "/guestAuth/app/rest"

  val buildFields: String = List(
    "id", "number", "buildType(name,projectName)", "status", "state",
    "revisions(revision(version))", "changes(change(username,comment,version))",
    "artifact-dependencies(build(number))"
  ).mkString(",");

  def getTeamCityBuild(number: String): Future[ApiResponse[TeamCityBuild]] = {
    val apiPath = "/guestAuth/app/rest"
    // state:any needed for running
    val url = s"${Configuration.teamcity.internalHost}${apiPath}/builds/number:$number,state:any,canceled(any)"

    httpClient.GET(url,
      queryString = Map("fields" -> buildFields),
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

  def getTeamCityBuilds(maybeProjectName: Option[String], maybeBuildTypeName: Option[String], maybePageSize: Option[Int]): Future[ApiResponse[List[TeamCityBuild]]] = {
    val url = s"${Configuration.teamcity.host}${apiPath}/builds"

    val locator: String = {
      List(
        maybeProjectName.map(id => s"project:(id:$id)"),
        maybeBuildTypeName.map(name => s"buildType:(name:$name)"),
        Some("state:any"),
        Some("canceled(any)"),
        maybePageSize.map(pageSize => s"count:${pageSize.toString}")
      ).flatten.mkString(",")
    }

    val queryString = Map("locator" -> locator, "fields" -> s"build(${buildFields})")

    httpClient.GET(url,
      queryString = queryString,
      headers = Map("Accept" -> "application/json")
    ).map { response =>
      val apiJsonBuild = (response.json \ "build")
      response.status match {
        case 200 => apiJsonBuild.validate[List[TeamCityBuild]] match {
          case JsSuccess(builds, _) => Right(builds)
          case JsError(error) => Left(ApiErrors(List(ApiError("Invalid JSON from Teamcity API", 500))))
        }
        case statusCode => Left(ApiErrors(List(ApiError(s"Invalid status code from TeamCity: $statusCode", 500))))
      }
    }
  }

}
object TeamcityService extends TeamcityService {
  override val httpClient = HttpClient
}

