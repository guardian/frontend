package model.diagnostics.freshness

import common.Logging
import model.diagnostics.CloudWatch

object UploadJob extends Logging {

  import FreshnessMetrics._

  def run() {

    log.info("Uploading freshness metrics")

    val frontCount = frontFreshnessCount.getAndReset
    val averageFrontFreshness = frontFreshnessTotal.getAndReset / (if (frontCount == 0) 1 else frontCount)

    val metrics = FreshnessMetrics.all.map{ metric =>
      s"${metric.group}-${metric.name}" -> metric.getAndReset.toDouble
    } ++ Seq(
      "front-freshness" -> averageFrontFreshness.toDouble
    )

    // Cloudwatch will not take more than 20 metrics at a time
    metrics.grouped(20).map(_.toMap).foreach(CloudWatch.put("Diagnostics", _))
  }

}
