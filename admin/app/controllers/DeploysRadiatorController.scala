package controllers.admin

import common.Logging
import conf.Configuration
import controllers.AuthLogging
import implicits.Requests
import model.NoCache
import play.api.libs.json._
import play.api.libs.ws.{WSResponse, WS}
import play.api.mvc.{Results, Result, Controller}
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.Future
import play.api.libs.json.Reads._
import play.api.libs.functional.syntax._
import scala.language.postfixOps

case class RiffRaffDeploy(
  uuid: String,
  projectName: String,
  build: String,
  stage: String,
  deployer: String,
  status: String,
  time: String)
object RiffRaffDeploy { implicit val format = Json.format[RiffRaffDeploy] }

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
                         projectName: String,
                         parentNumber: Option[String],
                         revision: String,
                         commits: List[Commit])

object TeamCityBuild {
  implicit val w = Json.writes[TeamCityBuild]
  implicit val r: Reads[TeamCityBuild] = (
    (__ \ "number").read[String] and
    (__ \ "buildType").read(
        (__ \ "projectName").read[String] and
        (__ \ "name").read[String]
        tupled
    ).map{case (project, name) => project + "::" + name} and
    (__ \ "artifact-dependencies" \ "build").read(
      (__ \\ "number").readNullable[String]
    ) and
    (__ \ "revisions" \ "revision" \\ "version").read[String] and
    (__ \ "changes" \ "change").read[List[Commit]]
  )(TeamCityBuild.apply _)
}

trait DeploysRadiatorController extends Controller with Logging with AuthLogging with Requests{
  //
  // API types
  //

  case class ApiError(message: String, statusCode: Int)
  object ApiError { implicit val format = Json.format[ApiError] }

  case class ApiErrors(errors: List[ApiError]) {
    def statusCode = errors.map(_.statusCode).max
  }

  type ApiResponse[T] = Either[ApiErrors, T]

  object ApiResults extends Results {
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

  protected def GET(url: String, queryString: Map[String, String] = Map.empty, headers: Map[String, String] = Map.empty): Future[WSResponse] = {
    WS.url(url).withQueryString(queryString.toSeq: _*).withHeaders(headers.toSeq: _*).withRequestTimeout(10000).get()
  }

  def getRiffRaffDeploys(pageSize: Option[String], projectName: Option[String], stage: Option[String]): Future[ApiResponse[List[RiffRaffDeploy]]] = {
    val url = s"${Configuration.riffraff.url}/api/history"

    GET(url,
      queryString = Map(
        "key" -> Configuration.riffraff.apiKey,
        "pageSize" -> pageSize.getOrElse(""),
        "projectName" -> projectName.getOrElse(""),
        "stage" -> stage.getOrElse("")
      )
    ).map { response =>
      response.status match {
        case 200 =>
          (response.json \ "response" \ "results").validate[List[RiffRaffDeploy]] match {
            case JsSuccess(listOfDeploys, _) => Right(listOfDeploys)
            case JsError(error) => Left(ApiErrors(List(ApiError("Invalid JSON from RiffRaff API", 500))))
          }
        case statusCode => Left(ApiErrors(List(ApiError(s"Invalid status code from RiffRaff: $statusCode", 500 ))))
      }
    }
  }

  def getTeamCityBuild(number: String): Future[ApiResponse[TeamCityBuild]] = {
    val apiPath = "/guestAuth/app/rest"
    val url = s"${Configuration.teamcity.host}${apiPath}/builds/number:$number,state:any,canceled(any)"

    GET(url,
      queryString = Map("fields" -> List(
        "number", "buildType(name,projectName)",
        "revisions(revision(version))", "changes(change(username,comment,version))",
        "artifact-dependencies(build(number))"
      ).mkString(",")),
      headers = Map("Accept" -> "application/json")
      ).map { response =>
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

object DeploysRadiatorController extends DeploysRadiatorController
