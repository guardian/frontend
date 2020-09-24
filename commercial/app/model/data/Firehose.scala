package commercial.model.data

import java.nio.ByteBuffer
import java.nio.charset.Charset

import awswrappers.kinesisfirehose._
import com.amazonaws.services.kinesisfirehose.model.{PutRecordRequest, PutRecordResult, Record}
import com.amazonaws.services.kinesisfirehose.{AmazonKinesisFirehoseAsync, AmazonKinesisFirehoseAsyncClientBuilder}
import conf.Configuration.aws.{mandatoryCredentials, region}

import scala.concurrent.Future

object Firehose {

  private lazy val firehose: AmazonKinesisFirehoseAsync = {
    AmazonKinesisFirehoseAsyncClientBuilder
      .standard()
      .withCredentials(mandatoryCredentials)
      .withRegion(region)
      .build()
  }

  private val charset = Charset.forName("UTF-8")

  def stream(streamName: String)(data: String): Future[PutRecordResult] = {
    val record = new Record().withData(ByteBuffer.wrap(s"$data\n".getBytes(charset)))
    val request = new PutRecordRequest().withDeliveryStreamName(streamName).withRecord(record)
    firehose.putRecordFuture(request)
  }
}
