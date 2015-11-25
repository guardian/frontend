package football.services

import scala.concurrent.{ExecutionContext, Future}
import play.api.libs.ws.WS
import play.api.Play.current
import org.joda.time.LocalDate
import java.io.File
import scala.util.{Failure, Success}
import play.Logger
import common.ExecutionContexts
import pa.{PaClient, Http, Response}
import conf.AdminConfiguration


trait Client extends PaClient with Http with ExecutionContexts {

  def apiKey: String

  override def GET(urlString: String): Future[pa.Response]

  override def get(suffix: String)(implicit context: ExecutionContext): Future[String] = super.get(suffix)(context)
}
private object Client extends Client {

  override def apiKey: String = AdminConfiguration.pa.footballApiKey
  override lazy val base = AdminConfiguration.pa.footballHost

  override def GET(urlString: String): Future[pa.Response] = {
    import play.api.Play.current
    WS.url(urlString).get().map { response =>
      pa.Response(response.status, response.body, response.statusText)
    }
  }

}
private object TestClient extends Client {
  override def GET(urlString: String): Future[Response] = ???

  override def get(suffix: String)(implicit context: ExecutionContext): Future[String] = {

    val todayString = LocalDate.now().toString("yyyyMMdd")
    val filename = {
      suffix
        .replace("/", "__")
        .replace(todayString, "TODAY")
    }
    val realApiCallPath = {
      suffix
        .replace("KEY", Client.apiKey)
    }

    current.getExistingFile(s"/admin/test/football/testdata/$filename.xml") match {
      case Some(file) => {
        val xml = scala.io.Source.fromFile(file, "UTF-8").getLines().mkString
        Future(xml)(context)
      }
      case None => {
        Logger.warn(s"Missing fixture for API response: $suffix ($filename)")
        val response = Client.get(realApiCallPath)(context)
        response.onComplete {
          case Success(str) => {
            Logger.info(s"writing response to testdata, $filename.xml, $str")
            writeToFile(s"${current.path}/admin/test/football/testdata/$filename.xml", str)
          }
          case Failure(writeError) => throw writeError
        }(context)
        response
      }
    }
  }

  def writeToFile(path: String, contents: String): Unit = {
    val writer = new java.io.PrintWriter(new File(path))
    try writer.write(contents) finally writer.close()
  }

  override def apiKey: String = "KEY"
}
trait GetPaClient {
  lazy val client: Client = if (play.Play.isTest) TestClient else Client
}
