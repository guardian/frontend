package agents

import common._
import conf.Configuration
import model.dotcomrendering.Trail
import services.S3Async

import scala.concurrent.{ExecutionContext, Future}

object DeeplyReadS3Agent extends S3Async {
  override lazy val bucket = Configuration.cache.bucket;
  lazy val stage: String = Configuration.environment.stage.toUpperCase
}

class DeeplyReadAgent extends GuLogging {

  private val deeplyReadItems = Box[Map[Edition, Seq[Trail]]](Map.empty)

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    log.debug(s"Deeply Read Agent refresh()")
    Future
      .sequence(Edition.allEditions.map { edition =>
        DeeplyReadS3Agent
          .getObjectAsJson[Seq[Trail]](
            s"${DeeplyReadS3Agent.stage}/deeply-read/${edition.id.toLowerCase()}.json",
          )
          .map(trailsList => {
            edition -> trailsList.take(10)
          })
      })
      .map(trailsList => {
        val map = trailsList.toMap
        for {
          (edition, list) <- map
        } yield log.debug(s"Deeply Read in ${edition.displayName}, ${list.size} items: ${list.map(_.url).toString()}")

        val mapWithTenItems = map.filter { case (_, list) => list.size == 10 }
        log.debug(
          s"Updating the following ${mapWithTenItems.size} editions: ${mapWithTenItems.keys.map(_.id).toList.sorted.toString()}",
        )

        deeplyReadItems.alter(deeplyReadItems.get() ++ mapWithTenItems)
      })
  }

  def getTrails(edition: Edition)(implicit ec: ExecutionContext): Seq[Trail] = {
    val updatedTrails = deeplyReadItems.get().getOrElse(edition, Seq.empty)
    if (updatedTrails.isEmpty) {
      refresh()
    }
    updatedTrails
  }

}
