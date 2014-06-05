package model.diagnostics.ads

import common.Logging
import model.diagnostics.CloudWatch

object UploadJob extends Logging {

  def run() {
    log.info("Uploading ads data into CloudWatch")
    CloudWatch.put("Ads", Metric.averages)
    Metric.reset()
  }

}
