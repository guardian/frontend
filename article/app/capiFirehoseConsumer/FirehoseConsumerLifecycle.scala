package capiFirehoseConsumer

import app.LifecycleComponent
import com.gu.contentapi.firehose.ContentApiFirehoseConsumer
import common.GuLogging
import conf.Configuration
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class FirehoseConsumerLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext)
    extends LifecycleComponent
    with GuLogging {

  appLifecycle.addStopHook { () =>
    Future {
      log.info("shutting down listener for crier events")
      contentApiFirehoseConsumer.shutdown()
    }
  }

  // Crier consumer
  val crierStreamReader = new CrierStreamReader

  val contentApiFirehoseConsumer = new ContentApiFirehoseConsumer(
    kinesisStreamReaderConfig = Configuration.contentApi.kinesisStreamReaderConfig,
    streamListener = crierStreamReader,
    filterProductionMonitoring = true,
  )

  override def start(): Unit = {
    log.info("starting listener for crier events")
    contentApiFirehoseConsumer.start()
  }
}
