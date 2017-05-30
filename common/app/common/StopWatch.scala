package common

object StopWatch {
  def apply() = new StopWatch
}

class StopWatch {
  private val startTime = System.currentTimeMillis

  def elapsed: Long = System.currentTimeMillis - startTime

  override def toString() = s"${elapsed}ms"
}
