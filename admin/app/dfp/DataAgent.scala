package dfp

import common.{AkkaAgent, ExecutionContexts, Logging}

import scala.concurrent.Future

trait DataAgent[K, V] extends ExecutionContexts with Logging {

  private val initialCache: DataCache[K, V] = DataCache(Map.empty[K, V])
  private lazy val cache = AkkaAgent(initialCache)

  def loadFreshData(): Map[K, V]

  def refresh(): Future[DataCache[K, V]] = {
    log.info("Refreshing data cache")
    cache alterOff { oldCache =>
      val freshData = loadFreshData()
      if (freshData.nonEmpty) {
        log.info("Fresh data loaded")
        DataCache(freshData)
      } else {
        log.error("No fresh data loaded so keeping old data")
        oldCache
      }
    }
  }

  def get: DataCache[K, V] = cache.get()
}
