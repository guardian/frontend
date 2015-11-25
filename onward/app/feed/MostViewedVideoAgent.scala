package feed

import com.gu.contentapi.client
import common._
import common.editions.Uk
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import model.{Video, _}
import play.api.libs.json._

import scala.concurrent.Future

object MostViewedVideoAgent extends Logging with ExecutionContexts {

  case class QueryResult(id: String, count: Double, paths: Seq[String])

  private val agent = AkkaAgent[Seq[Video]](Nil)

  implicit val ophanQueryReads = Json.reads[QueryResult]

  def mostViewedVideo(): Seq[Video] = agent()

  def refresh(): Unit = {
    log.info("Refreshing most viewed video.")

    val ophanResponse = services.OphanApi.getMostViewedVideos(hours = 3, count = 20)

    ophanResponse.map { result =>

      val paths: Seq[String] = for {
        videoResult <- result.asOpt[JsArray].map(_.value).getOrElse(Nil)
        path <- videoResult.validate[QueryResult].asOpt.map(_.paths).getOrElse(Nil) if path.contains("/video/")
      } yield {
        path
      }

      log.info(s"Number of paths returned from Ophan: ${paths.size}")

      val contentIds = paths.distinct.take(10)
        .map(id => id.drop(1)) // drop leading '/'
        .mkString(",")

      val mostViewed: Future[Seq[Video]] = getResponse(LiveContentApi.search(Uk)
        .ids(contentIds)
        .pageSize(20)
      ).map{ r =>
        val videoContent: List[client.model.Content] = r.results.filter(_.isVideo)
        log.info(s"Number of video content items from CAPI: ${videoContent.size}")
        videoContent.map(Content(_)).collect { case v: Video => v }
      }

      mostViewed.filter(_.nonEmpty).foreach(agent.alter)
    }
  }
}
