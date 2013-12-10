package client.connection.util

import scala.concurrent.ExecutionContext

object ExecutionContexts {
  val currentThreadContext = new ExecutionContext {
    def execute(runnable: Runnable) {
      runnable.run()
    }
    def reportFailure(t: Throwable) {
      ExecutionContext.defaultReporter(t)
    }
  }
}
