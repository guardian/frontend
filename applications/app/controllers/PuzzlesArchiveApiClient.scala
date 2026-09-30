package controllers

import common.GuLogging
import conf.Configuration
import play.api.libs.json.{Json, OFormat}
import play.api.libs.ws.WSClient

import java.time.LocalDate
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

case class ArchiveApiItem(
    puzzleId: String,
    puzzleType: String,
    publishDate: String,
    progress: Int,
    setterName: Option[String],
    gameUrl: Option[String],
)

object ArchiveApiItem {
  implicit val format: OFormat[ArchiveApiItem] = Json.format[ArchiveApiItem]
}

case class ArchiveApiResponse(results: Seq[ArchiveApiItem])
object ArchiveApiResponse {
  implicit val format: OFormat[ArchiveApiResponse] = Json.format[ArchiveApiResponse]
}

trait PuzzlesArchiveApi {
  def get(startDate: LocalDate, endDate: LocalDate, puzzleType: String)(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[ArchiveApiItem]]
}

class PuzzlesArchiveApiClient(wsClient: WSClient) extends PuzzlesArchiveApi with GuLogging {
  override def get(startDate: LocalDate, endDate: LocalDate, puzzleType: String)(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[ArchiveApiItem]] = {
    val archiveUrl = s"${Configuration.puzzlesApi.baseUrl.stripSuffix("/")}/archive"

    errorLoggingF(
      s"Puzzles archive request failed: url=$archiveUrl, startDate=$startDate, endDate=$endDate, puzzleType=$puzzleType",
    ) {
      wsClient
        .url(archiveUrl)
        .withHttpHeaders("X-Api-Key" -> Configuration.puzzlesApi.apiKey, "Accept" -> "application/json")
        .withQueryStringParameters(
          "startDate" -> startDate.toString,
          "endDate" -> endDate.toString,
          "puzzleType" -> puzzleType,
        )
        .withRequestTimeout(3.seconds)
        .get()
        .flatMap { response =>
          if (response.status >= 200 && response.status < 300) {
            response.json
              .validate[ArchiveApiResponse]
              .fold(
                errors => Future.failed(new IllegalArgumentException(s"Invalid puzzles archive response: $errors")),
                value => Future.successful(value.results),
              )
          } else {
            Future.failed(
              new RuntimeException(
                s"Puzzles archive returned HTTP ${response.status}: ${response.body.take(500)}",
              ),
            )
          }
        }
    }
  }
}
