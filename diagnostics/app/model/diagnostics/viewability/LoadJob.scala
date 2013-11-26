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
      log.info(s"ads.mpu.secondsInView:${MPU.secondsInView}")
      log.info(s"ads.inline.secondsInView:${Inline.secondsInView}")
      log.info(s"ads.firstView:${firstView.count}")
    }

    CloudWatch.put("Diagnostics", Map(
                    ("ads.top.count", Top.count),
                    ("ads.top.secondsInView", Top.secondsInView),
                    ("ads.bottom.count", Bottom.count),
                    ("ads.bottom.secondsInView", Bottom.secondsInView),
                    ("ads.mpu.count", MPU.count),
                    ("ads.mpu.secondsInView", MPU.secondsInView),
                    ("ads.inline.count", Inline.count),
                    ("ads.inline.secondsInView", Inline.secondsInView),
                    ("ads.views", firstView.count)
                  ))
    
    Top.reset()
    Bottom.reset()
    MPU.reset()
    Inline.reset()
    firstView.reset()

  }

}
