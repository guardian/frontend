package model.diagnostics

import org.joda.time.DateTime
import common.{Logging}
import play.cache._

object Metric extends Logging {

  var i = 0

  def increment(prefix: String) = {
    i = i + 1
    log.info(s"${i}")
    i
  }

  def get(key: String) = {
    i
  }

  def reset(key: String) = {
    i = 0
  }

}
