package model.diagnostics.abtests

import common.Logging
import model.diagnostics.CloudWatch

object UploadJob extends Logging {
  def run() {

    log.info("Uploading abtests data into CloudWatch")

    CloudWatch.put( "AbTests", Metric.viewsPerSession)

    Metric.reset()
  }
}
