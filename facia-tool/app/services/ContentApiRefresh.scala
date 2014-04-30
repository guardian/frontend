package services

import _root_.util.Futures._
import _root_.util.Enumerators._
import common.ExecutionContexts
import play.api.libs.iteratee.Enumerator
import scala.util.Try
import scala.concurrent.Future
import play.api.libs.ws.Response

/** Service to fully refresh the Content API data set based on the current state of the Facia tool */
object ContentApiRefresh extends ExecutionContexts {
  /** Enumerator of the collection IDs and a Try of the Response from Content API */
  def refresh(): Enumerator[(String, Try[Response])] =
    enumerate(ConfigAgent.getAllCollectionIds) { collectionId =>
      (ConfigAgent.getConfig(collectionId).map(ContentApiWrite.writeToContentapi) getOrElse {
        Future.failed(new RuntimeException(
          s"$collectionId, while present in config listing, does not have an entry there"
        ))
      }).mapTry.map(collectionId -> _)
    }
}
