package dfp

import common.{AkkaAgent, ExecutionContexts, Logging}
import conf.switches.Switches.DfpCachingSwitch
import org.apache.commons.lang.exception.ExceptionUtils
import org.joda.time.DateTime.now
import org.joda.time.{DateTime, Duration}

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

trait DataAgent[K, V] extends ExecutionContexts with Logging with implicits.Strings {

  private val initialCache: DataCache[K, V] = DataCache(now, Map.empty[K, V])
  private lazy val cache = AkkaAgent(initialCache)

  def loadFreshData: Try[Map[K, V]]

  def dataModifiedSince(threshold: DateTime): Try[Map[K, V]] = loadFreshData

  def refresh(): Future[DataCache[K, V]] = {
    log.info("Refreshing data cache")
    val threshold = now

    def refreshedDataCache(oldCache: DataCache[K, V], fetchedData: Try[Map[K, V]])
                          (resultingData: (Map[K, V], Map[K, V]) => Map[K, V]): DataCache[K, V] = {
      fetchedData match {
        case Success(freshData) =>
          if (freshData.nonEmpty) {
            val duration = new Duration(threshold, now)
            log.info(s"Loading DFP data took ${duration.getMillis} ms")
            DataCache(threshold, resultingData(oldCache.data, freshData))
          } else {
            log.error("No fresh data loaded so keeping old data")
            oldCache
          }
        case Failure(e) =>
          log.error(ExceptionUtils.getStackTrace(e))
          oldCache
      }
    }

    def completelyNewDataCache(oldCache: DataCache[K, V]): DataCache[K, V] = {
      refreshedDataCache(oldCache, loadFreshData) {
        case (oldData, freshData) => freshData
      }
    }

    def updatedDataCache(oldCache: DataCache[K, V]): DataCache[K, V] = {
      refreshedDataCache(oldCache, dataModifiedSince(oldCache.timestamp)) {
        case (oldData, freshData) => oldData ++ freshData
      }
    }

    cache alterOff { oldCache =>
      if (DfpCachingSwitch.isSwitchedOn) {
        if (oldCache.data.isEmpty) {
          completelyNewDataCache(oldCache)
        } else {
          updatedDataCache(oldCache)
        }
      } else {
        log.info("DFP caching switched off so no fresh data loaded")
        oldCache
      }
    }
  }

  def get: DataCache[K, V] = cache.get()
}
