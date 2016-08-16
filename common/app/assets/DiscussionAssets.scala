package assets

import java.net.URI

import app.LifecycleComponent
import common.{AkkaAgent, ExecutionContexts, GuardianConfiguration, JobScheduler, Logging}
import conf.switches.Switches
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

/**
  * External assets are not hosted by frontend but referenced in an assets map
  *
  * This class pull the assets map regularly and translates a generic name into a full URL
  *
  * The map is a JSON object looking like
  * {
  *   "name": "js/name.min.hash.js"
  * }
  * The path in the object value is relative to the assets map
  */
class DiscussionExternalAssetsLifecycle (config: GuardianConfiguration, wsClient: WSClient, jobs: JobScheduler)
  extends LifecycleComponent with ExecutionContexts with Logging {

  def refresh(): Future[Unit] = {
    config.discussion.frontendAssetsMap match {
      case Some(url) if Switches.DiscussionFetchExternalAssets.isSwitchedOn =>
        fetchAssetsMap(url, wsClient).map(
          parseResponse(_, url).map(DiscussionAssetsMap.alter(_, URI.create(url)))
        )
      case Some(_) =>
        log.info("Fetching discussion external assets is switched off")
        Future.successful(None)
      case None =>
        log.warn("External discussion frontend endpoint is not configured, you might want to update `discussion.frontend.assetsMap`")
        Future.successful(None)
    }
  }

  private def fetchAssetsMap(url: String, wsClient: WSClient): Future[WSResponse] = {
    wsClient.url(url)
      .withHeaders("User-Agent" -> "GU-ExternalAssets")
      .withRequestTimeout(4.seconds.toMillis)
      .get()
  }

  private def parseResponse(response: WSResponse, url: String): Option[Map[String, String]] = {
    response.status match {
      case 200 => asMap(response, url)
      case statusCode =>
        log.error(s"Cannot download discussion assets map from $url with status code $statusCode")
        None
    }
  }

  private def asMap(response: WSResponse, url: String): Option[Map[String, String]] = {
    Try(response.json.as[Map[String, String]]) match {
      case Success(assetsMap) => Some(assetsMap)
      case Failure(error) =>
        log.error(s"Invalid JSON assets map from $url", error)
        None
    }
  }


  def start(): Unit = {
    descheduleJobs()
    scheduleJobs()
    refresh()
  }

  private def scheduleJobs(): Unit = {
    jobs.scheduleEvery(
      "DiscussionRefreshAssetsMap",
      config.discussion.frontendAssetsMapRefreshInterval
    ) {
      refresh()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("DiscussionRefreshAssetsMap")
  }
}

object DiscussionAssetsMap {
  private lazy val agent = AkkaAgent[Map[String, String]](Map.empty)

  def alter (map: Map[String, String], baseURI: URI): Future[Map[String, String]] = {
    agent.alter(map.mapValues(value => baseURI.resolve(value).toString))
  }

  def getURL (assetName: String): String = {
    agent.get().getOrElse(assetName, "")
  }
}
