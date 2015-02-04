package css_report

import awswrappers.dynamodb._
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model.{AttributeValue, ScanResult, ScanRequest}

import scala.concurrent.Future
import scalaz.Monoid
import scalaz.syntax.monoid._

object DynamoDb {
  implicit class RichDynamoDbClient2(client: AmazonDynamoDBAsyncClient) {
    def sumScan[A: Monoid](scanRequest: ScanRequest)(f: ScanResult => A): Future[A] = {
      def getPage(startKey: Option[java.util.Map[String, AttributeValue]]): Future[A] = {
        client.scanFuture(scanRequest.withExclusiveStartKey(startKey.orNull)) flatMap { response =>

          Option(response.getLastEvaluatedKey) match {
            case None => Future.successful(f(response))

            case Some(key) =>
              getPage(Some(key)) map { laterResults =>
                f(response) |+| laterResults
              }
          }
        }
      }

      getPage(None)
    }
  }
}
