package dfp

import java.time.LocalDateTime

case class DataCache[K, V](timestamp: LocalDateTime, data: Map[K, V])

object DataCache {
  def apply[K, V](data: Map[K, V]): DataCache[K, V] = DataCache(LocalDateTime.now(), data)
}
