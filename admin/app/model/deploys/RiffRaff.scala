package model.deploys

import common.ExecutionContexts
import conf.Configuration
import model.deploys.ApiResults.{ApiError, ApiErrors, ApiResponse}
import play.api.libs.json.{JsError, JsSuccess, Json}
import scala.concurrent.Future

case class RiffRaffDeployTags(vcsRevision: String)
object RiffRaffDeployTags { implicit val format = Json.format[RiffRaffDeployTags] }

case class RiffRaffDeploy(uuid: String,
                          projectName: String,
                          build: String,
                          stage: String,
                          deployer: String,
                          status: String,
                          time: String,
                          tags: RiffRaffDeployTags)
object RiffRaffDeploy { implicit val format = Json.format[RiffRaffDeploy] }

class RiffRaffService(httpClient: HttpLike) extends ExecutionContexts {

  def getRiffRaffDeploys(projectName: Option[String], stage: Option[String], pageSize: Option[Int], status: Option[String] = None): Future[ApiResponse[List[RiffRaffDeploy]]] = {
    val url = s"${Configuration.riffraff.url}/api/history"

    httpClient.GET(url,
      queryString = Map("key" -> Configuration.riffraff.apiKey)
        ++ pageSize.map("pageSize" -> _.toString)
        ++ projectName.map("projectName" -> _)
        ++ stage.map("stage" -> _)
        ++ status.map("status" -> _)
    ).map { response =>
      response.status match {
        case 200 =>
          (response.json \ "response" \ "results").validate[List[RiffRaffDeploy]] match {
            case JsSuccess(listOfDeploys, _) => Right(listOfDeploys)
            case JsError(_) => Left(ApiErrors(List(ApiError("Invalid JSON from RiffRaff API", 500))))
          }
        case statusCode => Left(ApiErrors(List(ApiError(s"Invalid status code from RiffRaff: $statusCode", 500 ))))
      }
    }
  }
}
