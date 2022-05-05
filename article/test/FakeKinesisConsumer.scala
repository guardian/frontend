import conf.Configuration
import capiFirehoseConsumer.KinesisConsumerService
import com.gu.contentapi.firehose.ContentApiFirehoseConsumer

class FakeKinesisConsumer extends KinesisConsumerService {
  override def start = {}

  override def shutdown = {}
}
