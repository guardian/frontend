package dfp

import common.{Box, GuLogging}
import concurrent.BlockingOperations

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

trait DataAgent[K, V] extends GuLogging with implicits.Strings {

  private val initialCache: DataCache[K, V] = DataCache(Map.empty[K, V])
  private lazy val cache = Box(initialCache)

  def blockingOperations: BlockingOperations

  def loadFreshData(): Try[Map[K, V]]

  def refresh()(implicit executionContext: ExecutionContext): Future[DataCache[K, V]] = {
    log.info("Refreshing data cache")
    val start = System.currentTimeMillis
    blockingOperations.executeBlocking(loadFreshData()).map(freshIfExists(start))
  }

  private def freshIfExists(start: Long)(tryFreshData: Try[Map[K, V]]): DataCache[K, V] = {
    tryFreshData match {
      case Success(freshData) if freshData.nonEmpty =>
        val duration = System.currentTimeMillis - start
        log.info(s"Loading DFP data (${freshData.keys.size} items}) took $duration ms")
        val freshCache = DataCache(freshData)
        cache.send(freshCache)
        freshCache
      case Success(_) =>
        log.error("No fresh data loaded so keeping old data")
        cache.get()
      case Failure(e) =>
        log.error("Loading of fresh data has failed.", e)
        cache.get()
    }
  }

  def get: DataCache[K, V] = cache.get()
}
