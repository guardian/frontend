package model.deploys

import conf.Configuration
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.ws.WSResponse
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

case class TeamCityBuilds(builds: Seq[TeamCityBuild])

object TeamCityBuilds {
  implicit val r: Reads[TeamCityBuilds] = (__ \ "build").read[Seq[TeamCityBuild]].map{ list => TeamCityBuilds(list) }
}


class TeamcityService(httpClient: HttpLike) {

  private lazy val buildFields = List("id", "number", "buildType(name,projectName)", "status",
    "revisions(revision(version))", "changes(change(username,comment,version))",
    "artifact-dependencies(build(number))").mkString(",")

  private def GET[T](path: String, queryString: Map[String, String])(implicit r:Reads[T]): Future[T] = {
    val apiPath = "guestAuth/app/rest"
    val url = s"${Configuration.teamcity.internalHost}/$apiPath/$path"

    httpClient
      .GET(url, queryString, headers = Map("Accept" -> "application/json"))
      .map { response =>
        response.status match {
          case 200 => response.json.validate[T] match {
            case JsSuccess(obj, _) => obj
            case JsError(error) => throw new RuntimeException(s"Invalid JSON from Teamcity API: $error")
          }
          case statusCode => throw new RuntimeException(s"Invalid status code from TeamCity: $statusCode")
        }
      }
  }

  def getBuilds(project: String, count: Int = 10): Future[Seq[TeamCityBuild]] = {
    GET[TeamCityBuilds](
      path = "builds",
      queryString = Map("locator" -> s"buildType:(id:$project),count:$count") + ("fields" -> s"build(${buildFields})")
    ).map(_.builds)
  }

  def getBuild(number: String): Future[TeamCityBuild] = {
    GET[TeamCityBuild](
      path = s"builds/number:$number,state:any,canceled(any)",
      queryString = Map("fields" -> buildFields)
    )
  }

}
