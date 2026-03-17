package football.services

import scala.concurrent.{ExecutionContext, Future}
import play.api.libs.ws.WSClient
import play.api.{Environment, Mode}
import org.joda.time.LocalDate
import java.io.File
import scala.util.{Failure, Success}
import play.api.Logger
import common.GuLogging
import pa.{Http, PaClient, PaClientErrorsException, Response, Season, Team}
import conf.AdminConfiguration
import football.model.PA
import model.ApplicationContext
import play.api.mvc.RequestHeader

trait Client extends PaClient with Http {

  def apiKey: String

  override def GET(urlString: String): Future[pa.Response]

  override def get(suffix: String)(implicit context: ExecutionContext): Future[String] = super.get(suffix)(context)
}

private case class RealClient(wsClient: WSClient)(implicit context: ExecutionContext) extends Client {

  override def apiKey: String = AdminConfiguration.pa.footballApiKey

  override def GET(urlString: String): Future[pa.Response] = {
    wsClient.url(urlString).get().map { response =>
      pa.Response(response.status, response.body, response.statusText)
    }
  }

}
private case class TestClient(wsClient: WSClient, environment: Environment) extends Client {

  lazy val log = Logger(getClass)

  override def GET(urlString: String): Future[Response] = ???

  override def get(suffix: String)(implicit context: ExecutionContext): Future[String] = {

    val realClient = RealClient(wsClient)
    val todayString = LocalDate.now().toString("yyyyMMdd")
    val filename = {
      suffix
        .replace("/", "__")
        .replace(todayString, "TODAY")
    }
    val realApiCallPath = {
      suffix
        .replace("KEY", realClient.apiKey)
    }

    environment.getExistingFile(s"/admin/test/football/testdata/$filename.xml") match {
      case Some(file) =>
        val xml = scala.io.Source.fromFile(file, "UTF-8").getLines().mkString
        Future(xml)(context)
      case None =>
        log.warn(s"Missing fixture for API response: $suffix ($filename)")
        val response = realClient.get(realApiCallPath)(context)
        response.onComplete {
          case Success(str) => {
            log.debug(s"writing response to testdata, $filename.xml, $str")
            writeToFile(s"${environment.rootPath}/admin/test/football/testdata/$filename.xml", str)
          }
          case Failure(writeError) => throw writeError
        }(context)
        response
    }
  }

  def writeToFile(path: String, contents: String): Unit = {
    val file = new File(path)
    file.getParentFile().mkdirs()
    val writer = new java.io.PrintWriter(file)
    try writer.write(contents)
    finally writer.close()
  }

  override def apiKey: String = "KEY"
}

trait PaFootballClient {
  self: PaFootballClient with GuLogging =>

  implicit val executionContext: ExecutionContext
  implicit val context: ApplicationContext
  val wsClient: WSClient

  lazy val client: Client =
    if (context.environment.mode == Mode.Test) TestClient(wsClient, context.environment) else RealClient(wsClient)

  def fetchCompetitionsAndTeams(implicit request: RequestHeader): Future[(List[Season], List[Team])] =
    for {
      competitions <- client.competitions.map(PA.filterCompetitions)
      competitionTeams <- Future.traverse(competitions) { comp =>
        client.teams(comp.competitionId, comp.startDate, comp.endDate).recover { case e: PaClientErrorsException =>
          // 'No data' is returned as an error by PA API. Therefore we ignore exception and return an empty list
          logErrorWithRequestId(s"PA Client error when fetching teams for competition $comp: ", e)
          List()
        }
      }
      allTeams = competitionTeams.flatten.distinct
    } yield {
      (competitions, allTeams)
    }
}
