package awswrappers

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model._

object dynamodb {
  implicit class RichDynamoDbClient(dynamoDbClient: AmazonDynamoDBAsyncClient) {
    def updateItemFuture(updateItemRequest: UpdateItemRequest) =
      asFuture[UpdateItemRequest, UpdateItemResult](dynamoDbClient.updateItemAsync(updateItemRequest, _))

    def getItemFuture(getItemRequest: GetItemRequest) =
      asFuture[GetItemRequest, GetItemResult](dynamoDbClient.getItemAsync(getItemRequest, _))

    def queryFuture(queryRequest: QueryRequest) =
      asFuture[QueryRequest, QueryResult](dynamoDbClient.queryAsync(queryRequest, _))

    def scanFuture(scanRequest: ScanRequest) =
      asFuture[ScanRequest, ScanResult](dynamoDbClient.scanAsync(scanRequest, _))

    def putItemFuture(putItemRequest: PutItemRequest) =
      asFuture[PutItemRequest, PutItemResult](dynamoDbClient.putItemAsync(putItemRequest, _))

    def deleteItemFuture(deleteItemRequest: DeleteItemRequest)  =
      asFuture[DeleteItemRequest, DeleteItemResult](dynamoDbClient.deleteItemAsync(deleteItemRequest, _))
  }
}
