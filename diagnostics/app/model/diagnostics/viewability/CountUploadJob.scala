package model.diagnostics.viewability

import common._
import model.diagnostics.CloudWatch
import controllers.CountController

object CountUploadJob extends Logging {
  def run() {

    log.info("Uploading count metrics")

    val metrics = CountController.metrics.map{ case (prefix, metric) =>
      s"${metric.namespace}-${metric.name}" -> metric.count.getAndSet(0)
    }

    // Cloudwatch will not take more than 20 metrics at a time
    metrics.grouped(20).map(_.toMap).foreach(CloudWatch.put("Diagnostics", _))
  }

}
