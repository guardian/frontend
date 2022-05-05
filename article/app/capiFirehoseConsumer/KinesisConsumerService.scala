package capiFirehoseConsumer

import com.gu.contentapi.firehose.ContentApiFirehoseConsumer
import com.gu.contentapi.firehose.kinesis.KinesisStreamReaderConfig
import conf.Configuration

class KinesisConsumerService {

  private[this] def kinesisStreamReaderConfig: KinesisStreamReaderConfig =
    KinesisStreamReaderConfig(
      streamName = Configuration.contentApi.indexStream,
      app = "frontend",
      stage = "live",
      mode = Configuration.environment.stage,
      suffix = None,
      kinesisCredentialsProvider = Configuration.contentApi.capiKinesisCredsProvider,
      dynamoCredentialsProvider = Configuration.contentApi.dynamoCredsProvider,
      awsRegion = Configuration.aws.region,
    )

  // Crier consumer
  private[this] def crierStreamReader = new CrierStreamReader

  private[this] def contentApiFirehoseConsumer =
    new ContentApiFirehoseConsumer(
      kinesisStreamReaderConfig = kinesisStreamReaderConfig,
      streamListener = crierStreamReader,
      filterProductionMonitoring = true,
    )

  def start: Unit = {
    contentApiFirehoseConsumer.start()
  }

  def shutdown = {
    contentApiFirehoseConsumer.shutdown()
  }
}
