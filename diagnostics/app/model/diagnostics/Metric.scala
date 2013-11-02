package model.diagnostics

import org.joda.time.DateTime
import common.{Logging}

object Metric extends Logging {

  val metrics = collection.mutable.Map[String, Double]().withDefaultValue(0)

  def increment(prefix: String) {
    metrics.update(prefix, metrics(prefix) + 1.0)
  } 

  def count(prefix: String) {
    metrics(prefix)
  }
  
  // For the purpose of creating alarms we are more interested in increases in the average
  // number of errors over a minute.
  def averages = {
    val m = metrics.map(m => Seq(m._1 -> m._2.toDouble / metrics.values.sum) ).flatten.toMap
    collection.mutable.Map(m.toSeq: _*)
  }
  
  def all = {
    metrics
  }

  def reset {
    metrics.foreach(m => metrics.remove(m._1))
  }

}
