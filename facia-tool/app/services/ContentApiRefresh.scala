package services

import common.ExecutionContexts
import play.api.libs.iteratee.Enumerator
import play.api.libs.ws.WSResponse
import scala.concurrent.Future
import scala.util.Try
import util.Enumerators._
import util.Futures._

/** Service to fully refresh the Content API data set based on the current state of the Facia tool */
object ContentApiRefresh extends ExecutionContexts {
  /** Enumerator of the collection IDs and a Try of the Response from Content API */
  def refresh(): Enumerator[(String, Try[WSResponse])] =
    enumerate(ConfigAgent.getAllCollectionIds) { collectionId =>
      (ConfigAgent.getConfig(collectionId).map(ContentApiWrite.writeToContentapi(collectionId, _)) getOrElse {
        Future.failed(new RuntimeException(
          s"$collectionId, while present in config listing, does not have an entry there"
        ))
      }).mapTry.map(collectionId -> _)
    }
}
