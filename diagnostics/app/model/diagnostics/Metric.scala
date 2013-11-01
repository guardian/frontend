package model.diagnostics

import org.joda.time.DateTime
import common.{Logging}

object Metric extends Logging {

  val metrics = collection.mutable.Map[String, Int]().withDefaultValue(0)

  def increment(prefix: String) {
    metrics.update(prefix, metrics(prefix) + 1)
    // log.info(s"${prefix} - ${metrics(prefix)}")
  } 

  def count(prefix: String) {
    metrics(prefix)
  }
  
  def all = {
    metrics
  }

  def reset {
    metrics.foreach(m => metrics.remove(m._1))
  }

}
