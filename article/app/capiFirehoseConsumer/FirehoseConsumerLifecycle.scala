package capiFirehoseConsumer

import app.LifecycleComponent
import common.GuLogging
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class FirehoseConsumerLifecycle(
    appLifecycle: ApplicationLifecycle,
    kinesisConsumerService: KinesisConsumerService,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent
    with GuLogging {

  appLifecycle.addStopHook { () =>
    Future {
      log.info("shutting down listener for crier events")
      kinesisConsumerService.shutdown
    }
  }

  override def start(): Unit = {
    log.info("starting listener for crier events")
    kinesisConsumerService.start
  }
}
