package dfp

import common.{AkkaAgent, ExecutionContexts, Logging}

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

trait DataAgent[K, V] extends ExecutionContexts with Logging {

  private val initialCache: DataCache[K, V] = DataCache(Map.empty[K, V])
  private lazy val cache = AkkaAgent(initialCache)

  def loadFreshData(): Try[Map[K, V]]

  def refresh(): Future[DataCache[K, V]] = {
    log.info("Refreshing data cache")
    cache alterOff { oldCache =>
      loadFreshData() match {
        case Success(freshData) =>
          if (freshData.nonEmpty) {
            log.info("Fresh data loaded")
            DataCache(freshData)
          } else {
            log.error("No fresh data loaded so keeping old data")
            oldCache
          }
        case Failure(e) =>
          log.error(e.getStackTraceString)
          oldCache
      }
    }
  }

  def get: DataCache[K, V] = cache.get()
}
