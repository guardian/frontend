package dfp

import org.joda.time.DateTime

case class DataCache[K, V](timestamp: DateTime, data: Map[K, V])

object DataCache {
  def apply[K, V](data: Map[K, V]): DataCache[K, V] = DataCache(DateTime.now, data)
}
