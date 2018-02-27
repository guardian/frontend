package common.commercial

import app.LifecycleComponent
import com.gu.Box
import common.{AkkaAsync, JobScheduler, Logging}
import play.api.inject.ApplicationLifecycle
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal
import scala.util.{Failure, Success}

sealed trait OrielResult {
  def getLoaderScript: Option[String]
}

case object EmptyResult extends OrielResult {
  def getLoaderScript: Option[String] = None
}

case class JsonResult(jsonResult: JsValue, refreshTime: org.joda.time.DateTime) extends OrielResult {
  def getLoaderScript: Option[String] = jsonResult \ "loader_script" match {
    case JsDefined(JsString(script)) => Some(script)
    case JsDefined(_) => None
    case JsUndefined() => None
  }
}

object OrielCache extends Logging  {
  val cache: Box[OrielResult] = Box.apply(EmptyResult)

  val OrielUrl: String = "https://gw.oriel.io/api/domain/"
  val OrielApiKey: String = conf.Configuration.oriel.orielApiKey

  def getOrielResponse(wsClient: WSClient): Future[WSResponse] =
    wsClient
      .url(OrielUrl)
      .withHttpHeaders(("Authorization", s"Bearer $OrielApiKey"))
      .get

  def refresh(wsClient: WSClient)(implicit executionContext: ExecutionContext): Unit = {
    getOrielResponse(wsClient)
      .onComplete {
        case Success(result) =>
          result.status match {
            case 200 =>
              log.info(s"Successfully retrieved Oriel body at ${org.joda.time.DateTime.now().toString}")
              cache.send(JsonResult(Json.parse(result.body), org.joda.time.DateTime.now()))
            case _ => log.warn(s"Could not retrieve Oriel body code: ${result.status} ${result.body}")}
       case Failure(NonFatal(ex)) =>
        log.warn(s"Could not make request to Oriel: $ex")}
  }
}

class OrielCacheLifecycle(
  appLifeCycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync,
  wsClient: WSClient)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifeCycle.addStopHook { () => Future.apply {
    jobs.deschedule("OrielCacheRefreshJob")
  }}

  def refreshOrielCache(): Unit = OrielCache.refresh(wsClient)

  override def start(): Unit = {
    jobs.deschedule("OrielCacheRefreshJob")
    jobs.scheduleEveryNMinutes("OrielCacheRefreshJob", conf.Configuration.oriel.orielCacheTimeInMinutes) {
      refreshOrielCache()
      Future.successful(())
    }

    akkaAsync.after1s {
      refreshOrielCache()
    }
  }
}

