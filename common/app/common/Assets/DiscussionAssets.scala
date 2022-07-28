package common.Assets

import app.LifecycleComponent
import common.{Box, GuLogging, GuardianConfiguration, JobScheduler}
import conf.switches.Switches
import play.api.libs.ws.{WSClient, WSResponse}

import java.net.URI
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
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
class DiscussionExternalAssetsLifecycle(
    config: GuardianConfiguration,
    wsClient: WSClient,
    jobs: JobScheduler,
)(implicit executionContext: ExecutionContext)
    extends LifecycleComponent
    with GuLogging {

  def refresh(): Future[Map[String, String]] = {
    config.discussion.frontendAssetsMap match {
      case Some(url) if Switches.DiscussionFetchExternalAssets.isSwitchedOn =>
        val versionedUrl = url.replace("{VERSION}", config.discussion.frontendAssetsVersion)
        fetchAssetsMap(versionedUrl, wsClient)
          .map(
            parseResponse(_, versionedUrl) match {
              case Some(parsed) => DiscussionAssetsMap.alter(parsed, URI.create(versionedUrl))
              case None =>
                val errMsg = s"Impossible to parse discussion assets map from $versionedUrl"
                log.warn(errMsg)
                Future.failed(new RuntimeException(errMsg))
            },
          )
          .flatMap(identity)
      case Some(_) =>
        val errMsg = "Fetching discussion external assets is switched off"
        log.info(errMsg)
        Future.failed(new RuntimeException(errMsg))
      case None =>
        val errMsg =
          "External discussion frontend endpoint is not configured, you might want to update `discussion.frontend.assetsMap`"
        log.warn(errMsg)
        Future.failed(new RuntimeException(errMsg))
    }
  }

  private def fetchAssetsMap(url: String, wsClient: WSClient): Future[WSResponse] = {
    wsClient
      .url(url)
      .withHttpHeaders("User-Agent" -> "GU-ExternalAssets")
      .withRequestTimeout(4.seconds)
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
      config.discussion.frontendAssetsMapRefreshInterval,
    ) {
      refresh().map(_ => ())
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("DiscussionRefreshAssetsMap")
  }
}

object DiscussionAssetsMap {
  private lazy val agent = Box[Map[String, String]](Map.empty)

  def alter(map: Map[String, String], baseURI: URI): Future[Map[String, String]] = {
    agent.alter(map.mapValues(value => baseURI.resolve(value).toString))
  }

  def getURL(assetName: String): String = {
    agent.get().getOrElse(assetName, "")
  }
}
