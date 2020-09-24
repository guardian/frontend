package concurrent

import akka.actor.ActorSystem
import akka.pattern.CircuitBreaker
import common.Logging

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

object CircuitBreakerRegistry extends Logging {

  def withConfig(
      name: String,
      system: ActorSystem,
      maxFailures: Int,
      callTimeout: FiniteDuration,
      resetTimeout: FiniteDuration,
  ): CircuitBreaker = {

    val cb = new CircuitBreaker(
      scheduler = system.scheduler,
      maxFailures = maxFailures,
      callTimeout = callTimeout,
      resetTimeout = resetTimeout,
    )

    cb.onOpen(
      log.error(s"Circuit breaker ($name) OPEN (exceeded $maxFailures failures)"),
    )

    cb.onHalfOpen(
      log.info(s"Circuit breaker ($name) reset timeout (${resetTimeout}) finished. Entered half open state."),
    )

    cb.onClose(
      log.info(s"Circuit breaker ($name) is closed. Downstream looks healthy again."),
    )

    cb
  }
}
