package concurrent

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import org.apache.pekko.pattern.CircuitBreaker
import common.GuLogging

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

object CircuitBreakerRegistry extends GuLogging {

  def withConfig(
      name: String,
      system: PekkoActorSystem,
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
      log.error(
        s"Circuit breaker ($name) OPEN (exceeded $maxFailures failures) with $callTimeout (${callTimeout}) and resetTimeout (${resetTimeout}).",
      ),
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
