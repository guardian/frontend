package awswrappers

import com.amazonaws.services.sns.AmazonSNSAsync
import com.amazonaws.services.sns.model.{PublishRequest, PublishResult}

import scala.concurrent.Future

object sns {
  implicit class RichSnsAsyncClient(client: AmazonSNSAsync) {
    def publishFuture(publishRequest: PublishRequest): Future[PublishResult] =
      asFuture[PublishRequest, PublishResult](client.publishAsync(publishRequest, _))
  }
}
