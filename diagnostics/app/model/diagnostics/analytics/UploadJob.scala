package model.diagnostics.analytics

import common.Logging
import model.diagnostics.CloudWatch

object UploadJob extends Logging {
  def run() {

    log.info("Uploading analytics count metrics")

    CloudWatch.putMetrics(Metric.namespace, Metric.metrics.values.toList, Nil)
  }
}
