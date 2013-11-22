package model.diagnostics.viewability

import common._
import conf.Switches._
import model.diagnostics.CloudWatch

object LoadJob extends Logging {
  def run() {

    log.info("Loading viewability diagnostics data in to CloudWatch")

    if (AdDwellTimeLoggerSwitch.isSwitchedOn) {
      log.info(s"ads.top.count:${Top.count}")
      log.info(s"ads.top.secondsInView:${Top.secondsInView}")
      log.info(s"ads.bottom.count:${Bottom.count}")
      log.info(s"ads.bottom.secondsInView:${Bottom.secondsInView}")
    }

    CloudWatch.put("Diagnostics", Map(
                    ("ads.top.count", Top.count),
                    ("ads.top.secondsInView", Top.secondsInView),
                    ("ads.bottom.count", Bottom.count),
                    ("ads.bottom.secondsInView", Bottom.secondsInView)
                  ))
    Top.reset()
    Bottom.reset()
  }

}
