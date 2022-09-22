package services

import common.editions.Uk
import conf.switches.Switches.RelatedContentSwitch
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import play.api.test.FakeRequest
import test.{ConfiguredTestSuite, WithMaterializer, WithTestContentApiClient, WithTestWsClient}

import scala.concurrent.duration._
import scala.concurrent.Await

@DoNotDiscover class RelatedContentServiceTest
    extends AnyFlatSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestWsClient
    with WithTestContentApiClient {

  implicit val request = FakeRequest("GET", "/")

  lazy val relatedContentService = new RelatedContentService(
    testContentApiClient,
  )

  it should "have 10 related content items" in {
    val result =
      Await.result(relatedContentService.fetch(Uk, "music/2022/sep/20/liam-gallagher-at-50-oasis", Seq.empty), 1.second)

    result.trails.exists(_.headline.contains("Liam Gallagher")) shouldBe true
    result.trails.length shouldEqual 10
    result.heading shouldEqual "Related content"
  }

  it should "have 10 related articles without Liam Gallagher tag" in {
    RelatedContentSwitch.switchOff()
    val result = Await.result(
      relatedContentService.fetch(Uk, "music/2022/sep/20/liam-gallagher-at-50-oasis", Seq("music/liam-gallagher")),
      1.second,
    )

    result.trails.exists(_.headline.contains("Liam Gallagher")) shouldBe false
    result.trails.length shouldEqual 10
    result.heading shouldEqual "Related content"
  }

  it should "throw an error if RelatedContentSwitch is off" in {
    RelatedContentSwitch.switchOff()
    val result = scala.util.Try(
      Await.result(
        relatedContentService.fetch(Uk, "music/2022/sep/20/liam-gallagher-at-50-oasis", Seq("music/liam-gallagher")),
        1.second,
      ),
    )

    result.failed.get.getClass should RelatedContentDisabledException.getClass
  }
}
