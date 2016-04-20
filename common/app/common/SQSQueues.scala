package common

import java.util.concurrent.{Future => JavaFuture}

import com.amazonaws.handlers.AsyncHandler
import com.amazonaws.regions.{Region => AwsRegion}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model._
import play.api.libs.json.{Json, Reads, Writes}

import scala.collection.JavaConverters._
import scala.concurrent.{ExecutionContext, Future, Promise}
import scala.util.{Failure, Success}

object SQSQueues {
  implicit class RichAmazonSQSAsyncClient(client: AmazonSQSAsyncClient) {
    private def createHandler[A <: com.amazonaws.AmazonWebServiceRequest, B]() = {
      val promise = Promise[B]()

      val handler = new AsyncHandler[A, B] {
        override def onSuccess(request: A, result: B): Unit = promise.complete(Success(result))

        override def onError(exception: Exception): Unit = promise.complete(Failure(exception))
      }

      (promise.future, handler)
    }

    private def asFuture[A <: com.amazonaws.AmazonWebServiceRequest, B](f: AsyncHandler[A, B] => JavaFuture[B]) = {
      val (future, handler) = createHandler[A, B]()
      f(handler)
      future
    }

    def receiveMessageFuture(request: ReceiveMessageRequest): Future[ReceiveMessageResult] =
      asFuture[ReceiveMessageRequest, ReceiveMessageResult](client.receiveMessageAsync(request, _))

    def deleteMessageFuture(request: DeleteMessageRequest): Future[Void] =
      asFuture[DeleteMessageRequest, Void](client.deleteMessageAsync(request, _))

    def sendMessageFuture(request: SendMessageRequest): Future[SendMessageResult] =
      asFuture[SendMessageRequest, SendMessageResult](client.sendMessageAsync(request, _))

    def withRegion(region: AwsRegion) = {
      client.setRegion(region)
      client
    }
  }
}

case class MessageId(get: String) extends AnyVal
case class ReceiptHandle(get: String) extends AnyVal
case class Message[A](id: MessageId, get: A, handle: ReceiptHandle)

class MessageQueue[A](client: AmazonSQSAsyncClient, queueUrl: String)(implicit executionContext: ExecutionContext) {

  import SQSQueues._

  protected def sendMessage(sendRequest: SendMessageRequest) = {
    client.sendMessageFuture(sendRequest)
  }

  protected def receiveMessages(receiveRequest: ReceiveMessageRequest) = {
    client.receiveMessageFuture(receiveRequest.withQueueUrl(queueUrl)) map { response =>
      response.getMessages.asScala.toSeq
    }
  }

  protected def deleteMessage(handle: ReceiptHandle): Future[Unit] = {
    client.deleteMessageFuture(new DeleteMessageRequest()
      .withQueueUrl(queueUrl)
      .withReceiptHandle(handle.get)
    ).map(_ => ())
  }

}

/** Utility class for SQS queues that pass simple string messages */
case class TextMessageQueue[A](client: AmazonSQSAsyncClient, queueUrl: String)(implicit executionContext: ExecutionContext)
  extends MessageQueue[A](client, queueUrl)(executionContext) {

  def receive(request: ReceiveMessageRequest): Future[Seq[Message[String]]] = {
    receiveMessages(request) map { messages =>
      messages map { message =>
        Message(
          MessageId(message.getMessageId),
          message.getBody,
          ReceiptHandle(message.getReceiptHandle)
        )
      }
    }
  }

  def receiveOne(request: ReceiveMessageRequest): Future[Option[Message[String]]] = {
    receive(request.withMaxNumberOfMessages(1)) map { messages =>
      messages.toList match {
        case message :: Nil => Some(message)
        case Nil => None
        case _ => throw new RuntimeException(s"Asked for 1 message from queue but got ${messages.length}")
      }
    }
  }

  def delete(handle: ReceiptHandle): Future[Unit] =
    deleteMessage(handle)
}

/** Utility class for SQS queues that use JSON to serialize their messages */
case class JsonMessageQueue[A](client: AmazonSQSAsyncClient, queueUrl: String)(implicit executionContext: ExecutionContext)
                                      extends MessageQueue[A](client, queueUrl)(executionContext) {

  def send(a: A)(implicit writes: Writes[A]): Future[SendMessageResult] =
    sendMessage(new SendMessageRequest().withQueueUrl(queueUrl).withMessageBody(Json.stringify(Json.toJson(a))))

  def receive(request: ReceiveMessageRequest)(implicit reads: Reads[A]): Future[Seq[Message[A]]] = {
    receiveMessages(request) map { messages =>
      messages map { message =>
        Message(
          MessageId(message.getMessageId),
          Json.fromJson[A](Json.parse(message.getBody)) getOrElse {
            throw new RuntimeException(s"Couldn't parse JSON for message with ID ${message.getMessageId}: '${message.getBody}'")
          },
          ReceiptHandle(message.getReceiptHandle)
        )
      }
    }
  }

  def receiveOne(request: ReceiveMessageRequest)(implicit reads: Reads[A]): Future[Option[Message[A]]] = {
    receive(request.withMaxNumberOfMessages(1)) map { messages =>
      messages.toList match {
        case message :: Nil => Some(message)
        case Nil => None
        case _ => throw new RuntimeException(s"Asked for 1 message from queue but got ${messages.length}")
      }
    }
  }

  def delete(handle: ReceiptHandle): Future[Unit] =
    deleteMessage(handle)

}
