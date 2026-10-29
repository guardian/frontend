package jobs

import contentapi.ContentApiClient
import controllers.SiteMapController
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.when
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.test.FakeRequest
import play.api.test.Helpers._
import services.FilterSiteMap
import services.FilterSiteMap.{Region, Uk, Us}
import test.WithTestExecutionContext

import scala.concurrent.{Await, ExecutionContext, Future}
import scala.concurrent.duration._
import scala.xml.NodeSeq

class FilterSiteMapJobTest extends AnyFlatSpec with Matchers with MockitoSugar with WithTestExecutionContext {
  "Filter sitemap refresh" should "serve 503 before success and retain both regions and the index after failure" in {
    val service = mock[FilterSiteMap]
    val xml = <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>
    val sitemaps: Map[Region, NodeSeq] = Map(Uk -> xml, Us -> xml)
    val failure = new RuntimeException("CAPI unavailable")
    when(service.buildLatestSitemaps()(any[ExecutionContext])).thenReturn(
      Future.successful(None),
      Future.successful(Some(sitemaps)),
      Future.successful(None),
      Future.failed(failure),
    )
    val job = new SiteMapJob(mock[ContentApiClient], service)
    val controller = new SiteMapController(job, stubControllerComponents())
    val request = FakeRequest()

    status(controller.renderFilterSiteMapIndex()(request)) should be(SERVICE_UNAVAILABLE)
    status(controller.renderFilterSiteMap("uk")(request)) should be(SERVICE_UNAVAILABLE)
    status(controller.renderFilterSiteMap("us")(request)) should be(SERVICE_UNAVAILABLE)

    Await.result(job.updateFilter(), 5.seconds)
    job.filterSiteMapIndex() should be(None)
    job.filterSiteMap(Uk) should be(None)
    job.filterSiteMap(Us) should be(None)

    Await.result(job.updateFilter(), 5.seconds)
    val index = controller.renderFilterSiteMapIndex()(request)
    status(index) should be(OK)
    (scala.xml.XML.loadString(contentAsString(index)) \ "sitemap" \ "loc").size should be(2)
    header(CACHE_CONTROL, index).get should include("max-age=60")
    for (region <- Seq(Uk, Us)) {
      val result = controller.renderFilterSiteMap(region.id)(request)
      status(result) should be(OK)
      header(CACHE_CONTROL, result).get should include("max-age=60")
    }

    Await.result(job.updateFilter(), 5.seconds)
    job.filterSiteMap(Uk) should be(Some(xml))
    job.filterSiteMap(Us) should be(Some(xml))
    status(controller.renderFilterSiteMapIndex()(request)) should be(OK)

    intercept[RuntimeException](Await.result(job.updateFilter(), 5.seconds)) should be(failure)
    job.filterSiteMap(Uk) should be(Some(xml))
    job.filterSiteMap(Us) should be(Some(xml))
    status(controller.renderFilterSiteMapIndex()(request)) should be(OK)
    status(controller.renderFilterSiteMap("unknown")(request)) should be(NOT_FOUND)
  }
}
