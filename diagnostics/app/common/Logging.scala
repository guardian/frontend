package diagnostics

import play.api.mvc.RequestHeader
import net.sf.uadetector.service.UADetectorServiceFactory

object RequestQuery  {

  private val agent = UADetectorServiceFactory.getResourceModuleParser()

  def apply(request: RequestHeader) = {
    new RequestQuery(request)
  }
}

case class ErrorParameters(
  message: String,
  filename: String,
  lineno: String,
  build: String,
  errorType: String
)

class RequestQuery(private val request: RequestHeader) {

  lazy val isHealthCheck = userAgent startsWith "ELB-HealthChecker"
  lazy val queryString = request.queryString.map { case (k,v) => k -> v.mkString }
  lazy val userAgent = request.headers.get("user-agent").getOrElse("UNKNOWN USER AGENT")
  lazy val osFamily = {
    val ua = RequestQuery.agent.parse(userAgent)
    ua.getOperatingSystem().getFamily.toString match {
      case "OS_X"       => "osx"
      case "IOS"        => "ios"
      case "ANDROID"    => "android"
      case "WINDOWS"    => "windows"
      case "RIMOS"      => "rimos"
      case _            => "unknown"
    }
  }
  lazy val errorInfo = {
    ErrorParameters(
      message = queryString.getOrElse("message", "no message"),
      filename = queryString.getOrElse("filename", "no filename"),
      lineno = queryString.getOrElse("lineno", "no line no"),
      build = queryString.getOrElse("build", "no build no"),
      errorType = queryString.getOrElse("type", "no error type")
    )
  }
}

object JavascriptRequestLog {

  def apply(r: RequestHeader): String = {

    val error = RequestQuery(r).errorInfo

    s"JsError: ${error.message}, at: ${error.filename}#${error.lineno}, buildNo: ${error.build}, type: ${error.errorType}"
  }
}