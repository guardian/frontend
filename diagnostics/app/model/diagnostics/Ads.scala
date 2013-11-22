package model.diagnostics 

import common._
import conf._
import model.diagnostics._
import play.api.mvc.{ Content => _, _ }
import conf.Switches._

object Ads extends Logging {

  def report(top: Option[Int], bottom: Option[Int]) {
    
    if (AdDwellTimeLoggerSwitch.isSwitchedOn) {
      log.info(s"Top -> ${top}, Bottom -> ${bottom}")
    }

    top match {
      case Some(x:Int) =>
        Top.increment(x)
      case _ => {}
    }

    bottom match {
      case Some(x:Int) => {
        Bottom.increment(x)
      }
      case _ => {}
    }

  }
}
