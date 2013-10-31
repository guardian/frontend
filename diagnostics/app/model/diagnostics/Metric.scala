package model.diagnostics

import org.joda.time.DateTime
import common.{Logging}
import play.cache._

object Metric extends Logging {

  val metrics = collection.mutable.Map[String, Int]().withDefaultValue(0)
  
  def increment(prefix: String) = {
    metrics.update(prefix, metrics(prefix) + 1)
    log.info(s"${prefix} - ${metrics(prefix)}")
    metrics(prefix)
  }

  def count(prefix: String) = {
    metrics(prefix)
  }

  def reset = {
    metrics.drop(100) // FIXME clear the Map nicely
  }

}
