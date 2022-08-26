package conf

import org.joda.time.DateTime
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.matchers.should.Matchers
import play.api.mvc.{ControllerComponents, Result}
import play.api.test.{FakeRequest, Helpers}
import play.api.test.Helpers._
import test.{ConfiguredTestSuite, WithMaterializer, WithTestWsClient}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.wordspec.AnyWordSpec

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.Random

@DoNotDiscover class CachedHealthCheckTest
    extends AnyWordSpec
    with Matchers
    with ConfiguredTestSuite
    with ScalaFutures
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient {

  //Helper method to construct mock Results
  def mockResult(
      statusCode: Int,
      date: DateTime = DateTime.now,
      expiration: Option[Duration] = Some(10.seconds),
  ): HealthCheckResult = {
    val path = s"/path/${Random.alphanumeric.take(12).mkString}"
    statusCode match {
      case 200 => HealthCheckResult(path, HealthCheckResultTypes.Success(statusCode), date, expiration)
      case _ =>
        HealthCheckResult(path, HealthCheckResultTypes.Failure(statusCode, "Something went bad"), date, expiration)
    }
  }

  // Test helper method
  def getHealthCheck(
      mockResults: List[HealthCheckResult],
      policy: HealthCheckPolicy,
      precondition: Option[HealthCheckPrecondition] = None,
  )(testBlock: Future[Result] => Unit): Unit = {

    // Create a CachedHealthCheck controller with mock results
    val mockHealthChecks: Seq[SingleHealthCheck] = mockResults.map(result => ExpiringSingleHealthCheck(result.url))

    class MockController(val controllerComponents: ControllerComponents)
        extends CachedHealthCheck(policy, precondition)(mockHealthChecks: _*)(wsClient) {
      override val cache = new HealthCheckCache(precondition)(wsClient) {
        var remainingMockResults = mockResults
        override def fetchResult(baseUrl: String, healthCheck: SingleHealthCheck)(implicit
            executionContext: ExecutionContext,
        ): Future[HealthCheckResult] = {
          val result = remainingMockResults.head
          remainingMockResults = remainingMockResults.tail
          Future.successful(result)
        }
      }
    }

    val controller = new MockController(Helpers.stubControllerComponents())

    // Populate the cache and wait for it to finish
    whenReady(controller.runChecks()) { _ =>
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
          val mockResults = List(mockResult(200, resultDate, Some(expiration)))
          getHealthCheck(mockResults, HealthCheckPolicy.All) { response =>
            status(response) should be(503)
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
            status(response) should be(200)
          }
        }
      }
      "results which are never expiring" should {
        "200" in {
          val resultDate = DateTime.now.minus(scala.util.Random.nextLong()) // random date in the past
          val mockResults = List(mockResult(200, resultDate, None))
          getHealthCheck(mockResults, HealthCheckPolicy.All) { response =>
            status(response) should be(200)
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
          val mockResults = List(mockResult(200, resultDate, Some(expiration)), mockResult(404))
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
    "all requests should be failing" when {
      "precondition is NOT fulfilled" should {
        "503" in {
          val alwaysFailingPrecondition = HealthCheckPrecondition(() => false, "does not matter")
          getHealthCheck(
            List(mockResult(200), mockResult(200)),
            HealthCheckPolicy.All,
            Some(alwaysFailingPrecondition),
          ) { response =>
            status(response) should be(503)
          }
        }
      }
    }
  }
}
