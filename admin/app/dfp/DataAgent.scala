package dfp

import common.{AkkaAgent, Logging}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

trait DataAgent[K, V] extends Logging with implicits.Strings {

  private val initialCache: DataCache[K, V] = DataCache(Map.empty[K, V])
  private lazy val cache = AkkaAgent(initialCache)

  def loadFreshData(): Try[Map[K, V]]

  def refresh()(implicit executionContext: ExecutionContext): Future[DataCache[K, V]] = {
    log.info("Refreshing data cache")
    val start = System.currentTimeMillis
    cache alterOff { oldCache =>
      loadFreshData() match {
        case Success(freshData) if freshData.nonEmpty =>
          val duration = System.currentTimeMillis - start
          log.info(s"Loading DFP data (${freshData.keys.size} items}) took $duration ms")
          DataCache(freshData)
        case Success(_) =>
          log.error("No fresh data loaded so keeping old data")
          oldCache
        case Failure(e) =>
          log.error("Loading of fresh data has failed.", e)
          oldCache
      }
    }
  }

  def get: DataCache[K, V] = cache.get()
}
