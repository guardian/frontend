package awswrappers

import com.amazonaws.services.sns.AmazonSNSAsyncClient
import com.amazonaws.services.sns.model.{PublishResult, PublishRequest}

object sns {
  implicit class RichSnsAsyncClient(client: AmazonSNSAsyncClient) {
    def publishFuture(publishRequest: PublishRequest) =
      asFuture[PublishRequest, PublishResult](client.publishAsync(publishRequest, _))
  }
}
