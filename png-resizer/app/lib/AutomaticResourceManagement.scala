package lib

import scala.language.reflectiveCalls

object AutomaticResourceManagement {
  def withCloseable[T <: { def close() }, S](closeable: T)(body: T => S) = try {
    body(closeable)
  } finally {
    closeable.close()
  }
}
