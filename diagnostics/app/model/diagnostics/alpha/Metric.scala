package model.diagnostics.alpha

import com.google.common.util.concurrent.AtomicDouble

abstract class Metric {
  
  private lazy val metric = new AtomicDouble()

  def increment = {
    metric.addAndGet(1.0)
  }
  
  def count = { 
    metric.doubleValue match {
      case 0.0 => 0.01
      case _ => metric.doubleValue
    } 
  }

  def reset() {
    metric.set(0.0)
  }

}

object DesktopView extends model.diagnostics.alpha.Metric
object DesktopSession extends model.diagnostics.alpha.Metric
object ResponsiveSession extends model.diagnostics.alpha.Metric
object ResponsiveView extends model.diagnostics.alpha.Metric
