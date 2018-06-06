package awswrappers

import com.amazonaws.services.kinesisfirehose.AmazonKinesisFirehoseAsync
import com.amazonaws.services.kinesisfirehose.model.{PutRecordRequest, PutRecordResult}

import scala.concurrent.Future

object kinesisfirehose {
  implicit class RichKinesisFirehoseAsyncClient(client: AmazonKinesisFirehoseAsync) {
    def putRecordFuture(request: PutRecordRequest): Future[PutRecordResult] =
      asFuture[PutRecordRequest, PutRecordResult](client.putRecordAsync(request, _))
  }
}
