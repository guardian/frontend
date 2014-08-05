package common

object StopWatch {
  def apply() = new StopWatch
}

class StopWatch {
  private val startTime = System.currentTimeMillis

  def elapsed = System.currentTimeMillis - startTime
}
