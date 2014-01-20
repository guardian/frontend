package model.diagnostics.analytics

import common.Logging
import model.diagnostics.CloudWatch

object UploadJob extends Logging {
  def run() {

    log.info("Uploading count metrics")

    val metrics = Metric.metrics.map{ case (prefix, metric) =>
      s"${metric.namespace}-${metric.name}" -> metric.count.getAndSet(0).toDouble
    }

    // Cloudwatch will not take more than 20 metrics at a time
    metrics.grouped(20).map(_.toMap).foreach(CloudWatch.put("Diagnostics", _))
  }

}
