package services

import rx.lang.scala.Observable
import _root_.util.Observables._
import common.ExecutionContexts

/** Service to fully refresh the Content API data set based on the current state of the Facia tool */
object ContentApiRefresh extends ExecutionContexts {
  def refresh() = {
    val collectionIds = getCollectionIds()

    collectionIds zip refreshCollectionsWithIds(collectionIds).tries
  }

  /** Collection IDs currently in the Config */
  def getCollectionIds() = Observable.from(ConfigAgent.getAllCollectionIds)

  def refreshCollectionsWithIds(collectionIds: Observable[String]) = collectionIds flatMap { collectionId =>
    ConfigAgent.getConfig(collectionId) map { config =>
      Observable.from(ContentApiWrite.writeToContentapi(config))
    } getOrElse {
      throw new RuntimeException(s"$collectionId, while present in config listing, does not have an entry there")
    }
  }
}
