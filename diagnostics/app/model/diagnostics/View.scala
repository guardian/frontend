package model.diagnostics

import common.Logging
import java.util.concurrent.ConcurrentHashMap
import com.google.common.util.concurrent.AtomicDouble

object View extends Logging {

  private lazy val metric = new AtomicDouble()

  def increment = {
    metric.addAndGet(1.0)
  }

  def reset() {}
}
