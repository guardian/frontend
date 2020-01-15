package common

object StopWatch {
  def apply(): StopWatch = new StopWatch
}

class StopWatch {
  private val startTime = System.nanoTime

  def elapsedMS: Long = (System.nanoTime - startTime) / (10^6L)

  override def toString(): String = s"${elapsedMS}ms"
}
