package services

import com.amazonaws.services.simpleemail.model.MessageRejectedException
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.time.{Seconds, Span}
import org.scalatest.{FlatSpec, Matchers}

class EmailServiceTest extends FlatSpec with Matchers with ScalaFutures {

  implicit val defaultPatience = PatienceConfig(timeout = Span(60, Seconds))

  "sendEmail" should "not work for an invalid sender or recipient" in {
    val futureResponse = EmailService.send(
      from = "someaddress@theguardian.com",
      to = Seq("someotheraddress@theguardian.com"),
      subject = "testasync",
      body = "testing")

    whenReady(futureResponse.failed) { e =>
      e shouldBe a[MessageRejectedException]
    }
  }

  it should "not work for an invalid cc" in {
    val futureResponse = EmailService.send(
      from = "someaddress@theguardian.com",
      to = Seq("someotheraddress@theguardian.com"),
      cc = Seq("ccaddress@theguardian.com"),
      subject = "testasync",
      body = "testing")

    whenReady(futureResponse.failed) { e =>
      e shouldBe a[MessageRejectedException]
    }
  }

}
