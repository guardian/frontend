package awswrappers

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model._

import scala.concurrent.Future

object dynamodb {
  implicit class RichDynamoDbClient(dynamoDbClient: AmazonDynamoDBAsyncClient) {
    def updateItemFuture(updateItemRequest: UpdateItemRequest): Future[UpdateItemResult] =
      asFuture[UpdateItemRequest, UpdateItemResult](dynamoDbClient.updateItemAsync(updateItemRequest, _))

    def getItemFuture(getItemRequest: GetItemRequest): Future[GetItemResult] =
      asFuture[GetItemRequest, GetItemResult](dynamoDbClient.getItemAsync(getItemRequest, _))

    def queryFuture(queryRequest: QueryRequest): Future[QueryResult] =
      asFuture[QueryRequest, QueryResult](dynamoDbClient.queryAsync(queryRequest, _))

    def scanFuture(scanRequest: ScanRequest): Future[ScanResult] =
      asFuture[ScanRequest, ScanResult](dynamoDbClient.scanAsync(scanRequest, _))

    def putItemFuture(putItemRequest: PutItemRequest): Future[PutItemResult] =
      asFuture[PutItemRequest, PutItemResult](dynamoDbClient.putItemAsync(putItemRequest, _))

    def deleteItemFuture(deleteItemRequest: DeleteItemRequest): Future[DeleteItemResult] =
      asFuture[DeleteItemRequest, DeleteItemResult](dynamoDbClient.deleteItemAsync(deleteItemRequest, _))
  }
}
