package common

import java.util.concurrent.{Future => JavaFuture}
import play.api.libs.json.{Json, Reads, Writes}
import software.amazon.awssdk.services.sqs.SqsAsyncClient
import software.amazon.awssdk.services.sqs.model.{
  ChangeMessageVisibilityRequest,
  ChangeMessageVisibilityResponse,
  DeleteMessageRequest,
  Message => AWSMessage,
  ReceiveMessageRequest,
  SendMessageRequest,
  SendMessageResponse,
}

import scala.jdk.CollectionConverters._
import scala.jdk.FutureConverters._
import scala.collection.mutable
import scala.concurrent.{ExecutionContext, Future, Promise}
import scala.util.{Failure, Success}

//object SQSQueues {
//  implicit class RichAmazonSQSAsyncClient(client: SqsAsyncClient) {
//    private def createHandler[A <: com.amazonaws.AmazonWebServiceRequest, B]() = {
//      val promise = Promise[B]()
//
//      val handler = new AsyncHandler[A, B] {
//        override def onSuccess(request: A, result: B): Unit = promise.complete(Success(result))
//
//        override def onError(exception: Exception): Unit = promise.complete(Failure(exception))
//      }
//
//      (promise.future, handler)
//    }
//
//    private def asFuture[A <: com.amazonaws.AmazonWebServiceRequest, B](f: AsyncHandler[A, B] => JavaFuture[B]) = {
//      val (future, handler) = createHandler[A, B]()
//      f(handler)
//      future
//    }
//
//    def receiveMessageFuture(request: ReceiveMessageRequest): Future[ReceiveMessageResult] =
//      asFuture[ReceiveMessageRequest, ReceiveMessageResult](client.receiveMessageAsync(request, _))
//
//    def deleteMessageFuture(request: DeleteMessageRequest): Future[DeleteMessageResult] =
//      asFuture[DeleteMessageRequest, DeleteMessageResult](client.deleteMessageAsync(request, _))
//
//    def sendMessageFuture(request: SendMessageRequest): Future[SendMessageResult] =
//      asFuture[SendMessageRequest, SendMessageResult](client.sendMessageAsync(request, _))
//
//    def changeMessageVisibilityFuture(request: ChangeMessageVisibilityRequest): Future[ChangeMessageVisibilityResult] =
//      asFuture[ChangeMessageVisibilityRequest, ChangeMessageVisibilityResult](
//        client.changeMessageVisibilityAsync(request, _),
//      )
//  }
//}

case class MessageId(get: String) extends AnyVal
case class ReceiptHandle(get: String) extends AnyVal
case class Message[A](id: MessageId, get: A, handle: ReceiptHandle)

class MessageQueue[A](client: SqsAsyncClient, queueUrl: String)(implicit executionContext: ExecutionContext) {

//  import SQSQueues._

  protected def sendMessage(sendRequest: SendMessageRequest): Future[SendMessageResponse] = {
    client.sendMessage(sendRequest).asScala
  }

  def retryMessageAfter(handle: ReceiptHandle, timeoutSeconds: Int): Future[ChangeMessageVisibilityResponse] = {
    client
      .changeMessageVisibility(
        ChangeMessageVisibilityRequest
          .builder()
          .queueUrl(queueUrl)
          .receiptHandle(handle.get)
          .visibilityTimeout(timeoutSeconds)
          .build(),
      )
      .asScala
  }

  protected def receiveMessages(receiveRequest: ReceiveMessageRequest): Future[mutable.Buffer[AWSMessage]] = {
    client.receiveMessage(receiveRequest.toBuilder.queueUrl(queueUrl).build()).asScala map { response =>
      response.messages().asScala
    }
  }

  protected def deleteMessage(handle: ReceiptHandle): Future[Unit] = {
    client
      .deleteMessage(
        DeleteMessageRequest
          .builder()
          .queueUrl(queueUrl)
          .receiptHandle(handle.get)
          .build(),
      )
      .asScala
      .map(_ => ())
  }

}

/** Utility class for SQS queues that pass simple string messages */
case class TextMessageQueue[A](client: SqsAsyncClient, queueUrl: String)(implicit executionContext: ExecutionContext)
    extends MessageQueue[A](client, queueUrl)(executionContext) {

  def receive(request: ReceiveMessageRequest): Future[Seq[Message[String]]] = {
    receiveMessages(request) map { messages =>
      messages.toSeq map { message =>
        Message(
          MessageId(message.messageId()),
          message.body(),
          ReceiptHandle(message.receiptHandle()),
        )
      }
    }
  }

  def receiveOne(request: ReceiveMessageRequest): Future[Option[Message[String]]] = {
    receive(request.toBuilder.maxNumberOfMessages(1).build()) map { messages =>
      messages.toList match {
        case message :: Nil => Some(message)
        case Nil            => None
        case _              => throw new RuntimeException(s"Asked for 1 message from queue but got ${messages.length}")
      }
    }
  }

  def delete(handle: ReceiptHandle): Future[Unit] =
    deleteMessage(handle)
}

/** Utility class for SQS queues that use JSON to serialize their messages */
case class JsonMessageQueue[A](client: SqsAsyncClient, queueUrl: String)(implicit executionContext: ExecutionContext)
    extends MessageQueue[A](client, queueUrl)(executionContext) {

  def send(a: A)(implicit writes: Writes[A]): Future[SendMessageResponse] =
    sendMessage(SendMessageRequest.builder().queueUrl(queueUrl).messageBody(Json.stringify(Json.toJson(a))).build())

  def receive(request: ReceiveMessageRequest)(implicit reads: Reads[A]): Future[Seq[Message[A]]] = {
    receiveMessages(request) map { messages =>
      messages.toSeq map { message =>
        Message(
          MessageId(message.messageId()),
          Json.fromJson[A](Json.parse(message.body())) getOrElse {
            throw new RuntimeException(
              s"Couldn't parse JSON for message with ID ${message.messageId()}: '${message.body}'",
            )
          },
          ReceiptHandle(message.receiptHandle),
        )
      }
    }
  }

  def receiveOne(request: ReceiveMessageRequest)(implicit reads: Reads[A]): Future[Option[Message[A]]] = {
    receive(request.toBuilder.maxNumberOfMessages(1).build()) map { messages =>
      messages.toList match {
        case message :: Nil => Some(message)
        case Nil            => None
        case _              => throw new RuntimeException(s"Asked for 1 message from queue but got ${messages.length}")
      }
    }
  }

  def delete(handle: ReceiptHandle): Future[Unit] =
    deleteMessage(handle)

}
