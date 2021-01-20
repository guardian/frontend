package model.diagnostics.analytics

import common.GuLogging
import model.diagnostics.CloudWatch

object UploadJob extends GuLogging {
  def run() {

    log.info("Uploading analytics count metrics")

    CloudWatch.putMetrics(Metric.namespace, Metric.metrics.values.toList, Nil)
  }
}
