package model.deploys

import conf.Configuration
import model.deploys.ApiResults.{ApiResponse, ApiErrors, ApiError}
import play.api.libs.json.{JsError, JsSuccess, Json}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

case class RiffRaffDeploy(uuid: String,
                          projectName: String,
                          build: String,
                          stage: String,
                          deployer: String,
                          status: String,
                          time: String)
object RiffRaffDeploy { implicit val format = Json.format[RiffRaffDeploy] }

trait RiffRaffService {

  val httpClient: HttpClient

  def getRiffRaffDeploys(pageSize: Option[String], projectName: Option[String], stage: Option[String]): Future[ApiResponse[List[RiffRaffDeploy]]] = {
    val url = s"${Configuration.riffraff.url}/api/history"

    httpClient.GET(url,
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
}
object RiffRaffService extends RiffRaffService {
  override val httpClient = HttpClient
}

