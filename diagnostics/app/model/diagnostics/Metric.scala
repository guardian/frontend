package model.diagnostics

import org.joda.time.DateTime
import common.{Logging}
import play.cache._

object Metric extends Logging {
  
  def increment(prefix: String) = {
    
    val now = new DateTime().toString("HHmm")
    val cacheKey = s"${prefix}.${now}"
    val expiry = 300

    log.info(s"${cacheKey}")

    val count = Cache.get(cacheKey)

    if (count == null){
      Cache.set(cacheKey, 1, expiry)
    } else {
      Cache.set(cacheKey, count.toString.toInt + 1, expiry)
    }
    
    count
  }

  def get(key: String) = {
    Cache.get(key)
  }

}
