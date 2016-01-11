package controllers.admin

import common.Logging
import conf.Configuration
import controllers.AuthLogging
import implicits.Requests
import model.NoCache
import play.api.libs.json._
import play.api.libs.ws.WS
import play.api.mvc.{Results, Result, Controller}
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.Future

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
case class BuildJson(number: String, buildType: BuildTypeJson, changes: ChangesJson, `artifact-dependencies`: ArtifactDependenciesJson, revisions: RevisionsJson)

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
  //
  // API types
  //

  case class ApiError(message: String, statusCode: Int)
  object ApiError { implicit val format = Json.format[ApiError] }

  case class ApiErrors(errors: List[ApiError]) {
    def statusCode = errors.map(_.statusCode).max
  }

  type ApiResponse[T] = Either[ApiErrors, T]

  object ApiResponse extends Results {
    def apply[T](action: => ApiResponse[T])(implicit tjs: Writes[T]): Result ={
      action.fold(
        apiErrors =>
          Status(apiErrors.statusCode) {
            JsObject(Seq(
              "status" -> JsString("error"),
              "statusCode" -> JsNumber(apiErrors.statusCode),
              "errors" -> Json.toJson(apiErrors.errors)
            ))
          },
        response =>
          Ok {
            JsObject(Seq(
              "status" -> JsString("ok"),
              "response" -> Json.toJson(response)
            ))
          }
      )
    }
  }

  def getRiffRaffDeploys(pageSize: Option[String], projectName: Option[String], stage: Option[String]): Future[ApiResponse[JsValue]] = {
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
        case 200 => Right(response.json)
        case statusCode => Left(ApiErrors(List(ApiError(
          message = s"Invalid status code from RiffRaff: $statusCode",
          statusCode = 500
        ))))
      }
    }
  }

  def jsonToDeploys(json: JsValue): ApiResponse[List[Deploy]] = {
    (json \ "response" \ "results").validate[List[Deploy]] match {
      case JsSuccess(listOfDeploys, _) => Right(listOfDeploys)
      case JsError(errors) => Left(ApiErrors(List(ApiError("Failed to validate JSON", 500))))
    }
  }

  def getTeamCityBuild(number: String): Future[ApiResponse[JsValue]] = {
    val apiPath = "/guestAuth/app/rest"
    val url = s"${Configuration.teamcity.host}${apiPath}/builds/number:$number,state:any"

    WS.url(url)
      .withHeaders("Accept" -> "application/json")
      .withQueryString("fields" -> "number,buildType(name,projectName),revisions(revision(version)),changes(change(username,comment,version)),artifact-dependencies(build(number))")
      .get()
      .map { response =>
        response.status match {
          case 200 => Right(response.json)
          case statusCode => Left(ApiErrors(List(ApiError(
            message = s"Invalid status code from TeamCity: $statusCode",
            statusCode = 500
          ))))
        }
      }
  }

  def buildJsonToBuild(buildJson: BuildJson): ApiResponse[Build] = {
    val maybeBuild = buildJson.revisions.revision.headOption.map(_.version).map(revision => {
      Build(
        number = buildJson.number,
        projectName = s"${buildJson.buildType.projectName}::${buildJson.buildType.name}",
        parentNumber = buildJson.`artifact-dependencies`.build.headOption.map(b => b.number),
        revision = revision,
        commits = buildJson.changes.change.map(change => Commit(change.version, change.username, change.comment))
      )
    })

    maybeBuild
      .map(Right(_))
      .getOrElse(Left(ApiErrors(List(ApiError("Missing revision", 500)))))
  }

  def jsonToBuild(json: JsValue): ApiResponse[Build] = {
    json.validate[BuildJson] match {
      case JsSuccess(buildJson, _) => buildJsonToBuild(buildJson)
      case JsError(errors) => Left(ApiErrors(List(ApiError("Failed to validate JSON", 500))))
    }
  }

  //
  // Routes
  //

  def getDeploys(pageSize: Option[String], projectName: Option[String], stage: Option[String]) = AuthActions.AuthActionTest.async {
    getRiffRaffDeploys(pageSize, projectName, stage).map(riffRaffDeploysJson => {
      ApiResponse {
        for {
          json <- riffRaffDeploysJson.right
          deploys <- jsonToDeploys(json).right
        } yield deploys
      }
    })
  }

  def getBuild(number: String) = AuthActions.AuthActionTest.async {
    getTeamCityBuild(number).map(teamCityBuildJson => {
      ApiResponse {
        for {
          json <- teamCityBuildJson.right
          build <- jsonToBuild(json).right
        } yield build
      }
    })
  }

  def renderDeploysRadiator() = AuthActions.AuthActionTest {
    NoCache(Ok(views.html.deploysRadiator.main()))
  }

}
