package controllers.admin

import common.Logging
import conf.Configuration
import controllers.AuthLogging
import implicits.Requests
import model.NoCache
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.libs.ws.WS
import play.api.mvc.Controller
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._

case class Deploy(
  uuid: String,
  projectName: String,
  build: String,
  stage: String,
  deployer: String,
  status: String,
  time: String)
case class Commit(sha: String, username: String, message: String)
case class Build(number: String, projectName: String, parentNumber: Option[String], revision: String, commits: List[Commit])

object Deploy {
  implicit val format = Json.format[Deploy]
}

object Commit {
  implicit val format = Json.format[Commit]
}

object Build {
  implicit val format = Json.format[Build]
}

case class BuildTypeJson(name: String, projectName: String)
case class ChangeJson(version: String, username: String, comment: String)
case class ChangesJson(change: List[ChangeJson])
case class ArtifactDependenciesBuildJson(number: String)
case class ArtifactDependenciesJson(build: List[ArtifactDependenciesBuildJson])
case class RevisionJson(version: String)
object RevisionJson { implicit val format = Json.format[RevisionJson] }
case class RevisionsJson(revision: List[RevisionJson])
object RevisionsJson { implicit val format = Json.format[RevisionsJson] }
case class BuildJson(buildType: BuildTypeJson, changes: ChangesJson, `artifact-dependencies`: ArtifactDependenciesJson, revisions: RevisionsJson)

object BuildTypeJson {
  implicit val format = Json.format[BuildTypeJson]
}

object ChangeJson {
  implicit val format = Json.format[ChangeJson]
}

object ChangesJson {
  implicit val format = Json.format[ChangesJson]
}

object ArtifactDependenciesBuildJson {
  implicit val format = Json.format[ArtifactDependenciesBuildJson]
}

object ArtifactDependenciesJson {
  implicit val format = Json.format[ArtifactDependenciesJson]
}

object BuildJson {
  implicit val format = Json.format[BuildJson]
}

object DeploysRadiatorController extends Controller with Logging with AuthLogging with Requests{

  def getDeploys(pageSize: Option[String], projectName: Option[String], stage: Option[String]) = AuthActions.AuthActionTest.async {
    val url = s"${Configuration.riffraff.url}/api/history"

    WS.url(url)
      .withQueryString(
        "key" -> Configuration.riffraff.apiKey,
        "pageSize" -> pageSize.getOrElse(""),
        "projectName" -> projectName.getOrElse(""),
        "stage" -> stage.getOrElse(""))
      .get()
      .map { response =>
      response.status match {
        case 200 =>
          (response.json \ "response" \ "results").validate[List[Deploy]] match {
            case JsSuccess(listOfDeploys, _) => Ok(Json.toJson(listOfDeploys))
            case JsError(errors) =>
              log.error(errors.toString())
              InternalServerError
          }
        case error =>
          log.error(s"Invalid status code from RiffRaff: $error")
          InternalServerError
      }
    }
  }

  def getBuild(number: String) = AuthActions.AuthActionTest.async {
    val apiPath = "/guestAuth/app/rest"
    val url = s"${Configuration.teamcity.host}${apiPath}/builds/number:$number,state:any"

    WS.url(url)
      .withHeaders("Accept" -> "application/json")
      .withQueryString("fields" -> "buildType(name,projectName),revisions(revision(version)),changes(change(username,comment,version)),artifact-dependencies(build(number))")
      .get()
      .map { response =>
      response.status match {
        case 200 =>
          (response.json).validate[BuildJson] match {
            case JsSuccess(buildJson, _) =>
              Ok(Json.toJson(Build(
                number = number,
                projectName = s"${buildJson.buildType.projectName}::${buildJson.buildType.name}",
                parentNumber = buildJson.`artifact-dependencies`.build.headOption.map(b => b.number),
                revision = buildJson.revisions.revision.headOption.map(_.version).getOrElse(throw new RuntimeException("Missing revision")),
                commits = buildJson.changes.change.map(change => Commit(change.version, change.username, change.comment))
              )))
            case JsError(errors) =>
              log.error(errors.toString())
              InternalServerError
          }
        case statusCode =>
          log.error(s"Invalid status code from TeamCity: $statusCode")
          InternalServerError
      }
    }
  }

  def renderDeploysRadiator() = AuthActions.AuthActionTest {
    NoCache(Ok(views.html.deploysRadiator.main()))
  }

}
