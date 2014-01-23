package diagnostics

import play.api.mvc.RequestHeader
import net.sf.uadetector.service.UADetectorServiceFactory

object RequestQuery  {

  private val agent = UADetectorServiceFactory.getResourceModuleParser()

  def apply(request: RequestHeader) = {
    new RequestQuery(request)
  }
}

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
}

object JavascriptRequestLog {

  def apply(r: RequestHeader): String = {

    val query = RequestQuery(r)

    val errorLog = Seq(Some("JsError reported"),
                       query.queryString.get("message"),
                       query.queryString.get("filename"),
                       query.queryString.get("lineno"),
                       Some(query.osFamily)).flatten

    errorLog.mkString(", ")
  }
}