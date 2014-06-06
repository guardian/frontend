package model.diagnostics.ads

import common.Logging
import java.util.concurrent.ConcurrentHashMap
import com.google.common.util.concurrent.AtomicDouble
import scala.collection.convert.Wrappers

object Metric extends Logging {

  private lazy val metrics  = Wrappers.JConcurrentMapWrapper(new ConcurrentHashMap[String, AtomicDouble]())

  def increment(prefix: String, value: Int) = {
    metrics.putIfAbsent(prefix, new AtomicDouble(0.0))
    metrics(prefix).addAndGet(value)
  }

  // What was the average value over a minute
  def averages = {
    val snapshot = metrics.toMap
    val total = snapshot.values.map(_.doubleValue()).sum
    snapshot.map(m => m._1 -> m._2.doubleValue() / total)
  }

  def reset() = metrics.clear()

}
