package awswrappers

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model.{GetItemResult, GetItemRequest, UpdateItemResult, UpdateItemRequest}

object dynamodb {
  implicit class RichDynamoDbClient(dynamoDbClient: AmazonDynamoDBAsyncClient) {

    def updateItemFuture(updateItemRequest: UpdateItemRequest) =
      asFuture[UpdateItemRequest, UpdateItemResult](dynamoDbClient.updateItemAsync(updateItemRequest, _))

    def getItemFuture(getItemRequest: GetItemRequest) =
      asFuture[GetItemRequest, GetItemResult](dynamoDbClient.getItemAsync(getItemRequest, _))
  }
}
