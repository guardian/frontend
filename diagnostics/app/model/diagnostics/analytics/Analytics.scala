package model.diagnostics.analytics

object Analytics {

  def report(prefix: String) {
    val metric = Metric.metrics.get(prefix)
    metric.foreach(_.count.addAndGet(1))
  }

}
