package model.notifications

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBAsyncClient
import com.amazonaws.services.dynamodbv2.model._
import common.{ExecutionContexts, Logging}
import conf.Configuration
import model.notifications.DynamoDbStore._
import scala.collection.JavaConverters._
import awswrappers.dynamodb._
import scala.concurrent.Future
import play.api.libs.json._

import scala.util.{Failure, Success}

case class LatestMessage(title: String, body: String) {
    lazy val toJson = JsObject(
      Seq("title" -> JsString(title), "body" -> JsString(body))
    )
}

object LatestNotificationsDynamoDbStore extends Logging with ExecutionContexts {

    val tableName = "latest-notification-test"
    private val client = new AmazonDynamoDBAsyncClient(Configuration.aws.credentials.get)
    client.setRegion(Region.getRegion(Regions.EU_WEST_1))

    def storeMessage(gcmBrowserId: String, title: String, body: String): Unit = {

      val messageAttributeValue : AttributeValue =
        new AttributeValue().withL((1 until 3 map { case cnt =>
          new AttributeValue().withM(
            Map[String, AttributeValue] (
              ("title", new AttributeValue().withS(s"${title} ${cnt}")),
              ("body", new AttributeValue().withS(s"${body} ${cnt}"))
            ).asJava
          )
        }).asJava)


      val updateItemRequest = new UpdateItemRequest()
        .withTableName(tableName)
        .withKey(Map[String, AttributeValue] (
          ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
        ).asJava)
        .withAttributeUpdates(Map[String, AttributeValueUpdate](
          ("messages",
             new AttributeValueUpdate()
                .withAction(AttributeAction.PUT)
                .withValue(messageAttributeValue)
            )).asJava)

      client.updateItemFuture(updateItemRequest) onFailure {
        case t: Throwable =>
          val message = t.getMessage
          log.error(s"Unable to add new message to db: ${t.getMessage}" )
      }
    }

    def getLatestMessage(gcmBrowserId: String): Future[Map[String, AttributeValue]] = {

        val getItemRequest = new GetItemRequest()
          .withTableName(tableName)
          .withKey(Map[String,AttributeValue](
            ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
          ).asJava)

        val getItemResultFuture = client.getItemFuture(getItemRequest)

        getItemResultFuture map { result =>
            result.getItem.asScala.toMap
        }
    }

    def getLatestMessageAndCheck(gcmBrowserId: String): Future[List[LatestMessage]] = {

      println("Get Latest Message")

      val getItemRequest = new GetItemRequest()
        .withTableName(tableName)
        .withKey(Map[String,AttributeValue](
          ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
        ).asJava)

      val getItemResultFuture = client.getItemFuture(getItemRequest)

      getItemResultFuture map { result =>
          val resultMap = result.getItem.asScala.toMap
          getMessagesFromAttributeValues(resultMap)
      }
    }


    private def getMessagesFromAttributeValues(attributeValueMap: Map[String, AttributeValue]): List[LatestMessage] = {
         val messages = attributeValueMap.get("messages").map{
             messageAttributeList =>
                val messageList = messageAttributeList.getL
                messageList.asScala.toList.map {
                    message =>
                      val messageMap = message.getM.asScala.toMap
                      val title = messageMap.get("title").get.getS
                      val body = messageMap.get("body").get.getS
                      LatestMessage(title, body)
                }
         }
         //TODO should return Option[List], no?
         messages.getOrElse(List.empty)

    }

    def getLatestMessageAndDoConditionalWrite(gcmBrowserId: String) : Future[Option[List[LatestMessage]]]  = {

      println("Get Latest Message And do Write")

      def getUpdateAttributeValues( messages: List[LatestMessage] ) : AttributeValue = {
        val messageAttributeValues : AttributeValue
        = new AttributeValue().withL(
          (messages map {
            message => new AttributeValue().withM(
              Map[String, AttributeValue](
                ("title", new AttributeValue().withS(message.title)),
                ("body", new AttributeValue().withS(message.body))
              ).asJava
            )
          }).asJava
        )
        messageAttributeValues
      }

      def getUpdateFailAttributes( messages: List[LatestMessage]) : AttributeValue = {
         val messageAttributes : AttributeValue = new AttributeValue().withL(
           (messages.map {
             message => new AttributeValue().withM(
                Map[String, AttributeValue](
                  ("title", new AttributeValue().withS("Some bollox")),
                  ("body", new AttributeValue().withS("Some more bollox"))
                ).asJava
             )
           }).asJava
         )
         messageAttributes
      }

      def getExpectedAttributeValue(attributeValue: AttributeValue) : ExpectedAttributeValue = {
        val expectedAttributeValues : ExpectedAttributeValue = new ExpectedAttributeValue()
          .withComparisonOperator(ComparisonOperator.EQ)
          .withValue(attributeValue)
        expectedAttributeValues
      }

      getLatestMessageAndCheck(gcmBrowserId).flatMap {
          messages =>
            println("Got Latest Message")
            val latestMessage = messages.reverse.head
            val messageUpdateAttribute = getUpdateAttributeValues(messages)
            //val messageUpdateAttribute = getUpdateFailAttributes(messages)
            val expectedAttribute = getExpectedAttributeValue(messageUpdateAttribute)

            val updateItemRequest  = new UpdateItemRequest()
              .withTableName(tableName)
              .withKey(Map[String, AttributeValue] (
                ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
              ).asJava)

              .withAttributeUpdates(Map[String, AttributeValueUpdate](
                ("messages", new AttributeValueUpdate()
                  .withAction(AttributeAction.PUT)
                  .withValue(messageUpdateAttribute))
              ).asJava )


            updateItemRequest addExpectedEntry("messages", expectedAttribute)

            println("Make Req")
            val updateItemFuture = client.updateItemFuture(updateItemRequest)
            println("My bad")


            updateItemFuture.map {
              updatedMessages =>
                println("Written latest message")
                Some(messages)
            }.recover{
              case _ =>
                println("Gotcha, mothafookah")
                None

            }
       }
    }

    def getLatestMessageAndDoConditionalWriteAndFail(gcmBrowserId: String) : Future[Option[List[LatestMessage]]] = {

      println("Get Latest Message And do Write")

      def getUpdateAttributeValues( messages: List[LatestMessage] ) : AttributeValue = {
        val messageAttributeValues : AttributeValue
        = new AttributeValue().withL(
          (messages map {
            message => new AttributeValue().withM(
              Map[String, AttributeValue](
                ("title", new AttributeValue().withS(message.title)),
                ("body", new AttributeValue().withS(message.body))
              ).asJava
            )
          }).asJava
        )
        messageAttributeValues
      }

      def getUpdateFailAttributes( messages: List[LatestMessage]) : AttributeValue = {
         val messageAttributes : AttributeValue = new AttributeValue().withL(
           (messages.map {
             message => new AttributeValue().withM(
                Map[String, AttributeValue](
                  ("title", new AttributeValue().withS("Some bollox")),
                  ("body", new AttributeValue().withS("Some more bollox"))
                ).asJava
             )
           }).asJava
         )
         messageAttributes
      }

      def getExpectedAttributeValue(attributeValue: AttributeValue) : ExpectedAttributeValue = {
        val expectedAttributeValues : ExpectedAttributeValue = new ExpectedAttributeValue()
          .withComparisonOperator(ComparisonOperator.EQ)
          .withValue(attributeValue)
        expectedAttributeValues
      }

      getLatestMessageAndCheck(gcmBrowserId).flatMap {
          messages =>
            println("Got Latest Message")
            val latestMessage = messages.reverse.head
            //val messageUpdateAttribute = getUpdateAttributeValues(messages)
            val messageUpdateAttribute = getUpdateFailAttributes(messages)
            val expectedAttribute = getExpectedAttributeValue(messageUpdateAttribute)

            val updateItemRequest  = new UpdateItemRequest()
              .withTableName(tableName)
              .withKey(Map[String, AttributeValue] (
                ("gcmBrowserId", new AttributeValue().withS(gcmBrowserId))
              ).asJava)

              .withAttributeUpdates(Map[String, AttributeValueUpdate](
                ("messages", new AttributeValueUpdate()
                  .withAction(AttributeAction.PUT)
                  .withValue(messageUpdateAttribute))
              ).asJava )


            updateItemRequest addExpectedEntry("messages", expectedAttribute)

            println("Make Req")
            val updateItemFuture = client.updateItemFuture(updateItemRequest)
            println("My bad")

            updateItemFuture.map {
              updatedMessages =>
                Option(messages)
            }.recover{
              case _ =>
               None
            }
       }
    }


}
