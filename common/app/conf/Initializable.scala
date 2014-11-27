package conf

import java.util.concurrent.TimeoutException

import common.{ExecutionContexts, Logging}
import play.api.Play.current
import play.api.libs.concurrent.Akka

import scala.concurrent.duration._
import scala.concurrent.{Future, Promise}

trait Initializable[T] extends ExecutionContexts with Logging {

  private val initialized = Promise[T]()

  protected val initializationTimeout: FiniteDuration = 1.minute

  Akka.system.scheduler.scheduleOnce(initializationTimeout) {
    initialized.tryFailure {
      new TimeoutException(s"Initialization timed out after $initializationTimeout")
    }
  }

  initialized.future.onFailure {
    case e: Exception => log.error(s"Initialization failed: ${e.getMessage}")
  }

  def initialized(t: T): Unit = initialized.trySuccess(t)

  def onInitialized: Future[T] = initialized.future
}
