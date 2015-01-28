package awswrappers

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model.{PutItemResult, PutItemRequest, UpdateItemResult, UpdateItemRequest}

object dynamodb {
  implicit class RichDynamoDbClient(dynamoDbClient: AmazonDynamoDBAsyncClient) {
    def updateItemFuture(updateItemRequest: UpdateItemRequest) =
      asFuture[UpdateItemRequest, UpdateItemResult](dynamoDbClient.updateItemAsync(updateItemRequest, _))

    def putItemFuture(putItemRequest: PutItemRequest) =
      asFuture[PutItemRequest, PutItemResult](dynamoDbClient.putItemAsync(putItemRequest, _))
  }
}
