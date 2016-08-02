package conf

import common.ExecutionContexts
import org.joda.time.DateTime
import org.scalatest.{BeforeAndAfterAll, Matchers, WordSpec}
import play.api.mvc.Result
import play.api.test.FakeRequest
import play.api.test.Helpers._
import test.{SingleServerSuite, WithTestWsClient}
import org.scalatest.concurrent.ScalaFutures

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.Random

class CachedHealthCheckTest
  extends WordSpec
  with Matchers
  with SingleServerSuite
  with ScalaFutures
  with ExecutionContexts
  with BeforeAndAfterAll
  with WithTestWsClient {

  //Helper method to construct mock Results
  def mockResult(statusCode: Int, date: DateTime = DateTime.now, expiration: HealthCheckExpiration = HealthCheckExpires.Duration(10.seconds)): HealthCheckResult = {
    val path = s"/path/${Random.alphanumeric.take(12).mkString}"
    statusCode match {
      case 200 => new HealthCheckResult(path, HealthCheckResultTypes.Success(statusCode), date, expiration)
      case _ => new HealthCheckResult(path, HealthCheckResultTypes.Failure(statusCode, "Something went bad"), date, expiration)
    }
  }

  // Test helper method
  def getHealthCheck(mockResults: List[HealthCheckResult], policy: HealthCheckPolicy)(testBlock: Future[Result] => Unit) = {

    // Create a CachedHealthCheck controller with mock results
    val mockHealthChecks: Seq[SingleHealthCheck] = mockResults.map(result => ExpiringSingleHealthCheck(result.url))
    val mockTestPort: Int = 9100
    val controller = new CachedHealthCheck(policy, wsClient, mockTestPort, mockHealthChecks:_*) {
      override val cache = new HealthCheckCache(wsClient) {
        override def fetchResults(testPort: Int, paths: SingleHealthCheck*): Future[Seq[HealthCheckResult]] = {
          Future.successful(mockResults)
        }
      }
    }

    // Populate the cache and wait for it to finish
    whenReady(controller.runChecks) { _ =>
      // Call the /_healthcheck endpoint on this controller
      val healthCheckRequest = FakeRequest(method = "GET", path = "/_healthcheck")
      val response = call(controller.healthCheck(), healthCheckRequest)
      // Pass the response to the testBlock
      testBlock(response)
    }
  }

  "GET /_healthcheck" when {
    "all requests must be successful" when {
      "cache result is empty" should {
        "503" in {
          getHealthCheck(List(), HealthCheckPolicy.All) { response =>
            status(response) should be(503)
          }
        }
      }
      "cached result is expired" should {
        "503" in {
          val expiration = 5.seconds
          val resultDate = DateTime.now.minus(expiration.toMillis + 1)
          val mockResults = List(mockResult(200, resultDate, HealthCheckExpires.Duration(expiration)))
          getHealthCheck(mockResults, HealthCheckPolicy.All) { response =>
            status(response) should be (503)
          }
        }
      }
      "only one cached result is successful" should {
        "503" in {
          val mockResults = List(mockResult(500), mockResult(200))
          getHealthCheck(mockResults, HealthCheckPolicy.All) { response =>
            status(response) should be(503)
          }
        }
      }
      "cached results are all successful" should {
        "200" in {
          val mockResults = List(mockResult(200), mockResult(200))
          getHealthCheck(mockResults, HealthCheckPolicy.All) { response =>
            status(response) should be (200)
          }
        }
      }
      "results which are never expiring" should {
        "200" in {
          val resultDate = DateTime.now.minus(scala.util.Random.nextLong) // random date in the past
          val mockResults = List(mockResult(200, resultDate, HealthCheckExpires.Never))
          getHealthCheck(mockResults, HealthCheckPolicy.All) { response =>
            status(response) should be (200)
          }
        }
      }
    }
    "at least one request must be successful" when {
      "cache result is empty" should {
        "503" in {
          getHealthCheck(List(), HealthCheckPolicy.Any) { response =>
            status(response) should be(503)
          }
        }
      }
      "one cached result is successful but expired" should {
        "503" in {
          val expiration = 5.seconds
          val resultDate = DateTime.now.minus(expiration.toMillis + 1)
          val mockResults = List(mockResult(200, resultDate, HealthCheckExpires.Duration(expiration)), mockResult(404))
          getHealthCheck(mockResults, HealthCheckPolicy.Any) { response =>
            status(response) should be(503)
          }
        }
      }
      "no cached result is successful" should {
        "503" in {
          val mockResults = List(mockResult(400), mockResult(500))
          getHealthCheck(mockResults, HealthCheckPolicy.Any) { response =>
            status(response) should be(503)
          }
        }
      }
      "one cached result is successful" should {
        "200" in {
          val mockResults = List(mockResult(200), mockResult(404))
          getHealthCheck(mockResults, HealthCheckPolicy.Any) { response =>
            status(response) should be(200)
          }
        }
      }
    }
  }
}
