package common.Logback

import java.util.concurrent.{ThreadFactory, ThreadPoolExecutor}
import akka.actor.ActorSystem
import akka.dispatch.MessageDispatcher
import akka.pattern.CircuitBreaker
import ch.qos.logback.classic.spi.ILoggingEvent
import com.amazonaws.ClientConfiguration
import com.amazonaws.auth.AWSCredentialsProvider
import com.amazonaws.client.builder.AwsAsyncClientBuilder
import com.amazonaws.retry.{PredefinedRetryPolicies, RetryPolicy}
import com.amazonaws.services.kinesis.{AmazonKinesisAsync, AmazonKinesisAsyncClient}
import com.amazonaws.services.kinesis.AmazonKinesisAsyncClient.asyncBuilder
import com.gu.logback.appender.kinesis.KinesisAppender

import scala.concurrent.duration._
import scala.concurrent.Future

// LogbackOperationsPool must be wired as a singleton
class LogbackOperationsPool(val actorSystem: ActorSystem) {
  val logbackOperations: MessageDispatcher = actorSystem.dispatchers.lookup("akka.logback-operations")
}

// The KinesisAppender[ILoggingEvent] blocks logging operations on putMessage. This overrides the KinesisAppender api, executing putMessage in an
// independent threadpool
class SafeBlockingKinesisAppender(logbackOperations: LogbackOperationsPool) extends KinesisAppender[ILoggingEvent] {

  private val breaker = new CircuitBreaker(
    logbackOperations.actorSystem.scheduler,
    maxFailures = 1,
    callTimeout = 1.seconds,
    resetTimeout = 10.seconds,
  )(logbackOperations.logbackOperations)

  override protected def createClient(
      credentials: AWSCredentialsProvider,
      configuration: ClientConfiguration,
      executor: ThreadPoolExecutor,
  ): AmazonKinesisAsyncClient = {
    configuration.setMaxErrorRetry(0)
    configuration.setRetryPolicy(
      new RetryPolicy(
        PredefinedRetryPolicies.NO_RETRY_POLICY.getRetryCondition,
        PredefinedRetryPolicies.DEFAULT_BACKOFF_STRATEGY,
        0,
        true,
      ),
    )

    // Trying to get rid of the deprecated class
//    AmazonKinesisAsyncClient.asyncBuilder
//      .withCredentials(credentials)
//      .withClientConfiguration(configuration)
//      .withExecutorFactory(ThreadFactory)
//      .build()

    new AmazonKinesisAsyncClient(credentials, configuration, executor)
  }

  override protected def putMessage(message: String): Unit = {
    breaker.withCircuitBreaker {
      Future {
        super.putMessage(message)
      }(
        logbackOperations.logbackOperations,
      ) // the logbackOperations thread pool is passed explicitly here so blocking on putMessage doesn't affect the logging thread.
    }
    ()
  }
}
