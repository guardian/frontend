package services

import scala.concurrent.duration._
import scala.concurrent.Await
import com.gu.facia.client.models.{ConfigJson, FrontJson}
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import test.WithTestApplicationContext

@DoNotDiscover class ConfigAgentTest
    extends AnyFlatSpec
    with Matchers
    with WithTestApplicationContext
    with BeforeAndAfterAll {

  val emptyFrontJson = FrontJson(
    collections = List(),
    navSection = None,
    webTitle = None,
    title = None,
    description = None,
    onPageDescription = None,
    imageUrl = None,
    imageWidth = None,
    imageHeight = None,
    isImageDisplayed = None,
    priority = None,
    isHidden = None,
    canonical = None,
    group = None,
  );

  val fronts = ConfigJson(
    Map(
      "front-1" -> emptyFrontJson.copy(collections = List("abc", "def", "ghi")),
      "front-2" -> emptyFrontJson.copy(collections = List("ghi")),
    ),
    Map.empty,
  )

  override def beforeAll(): Unit = {
    val refresh = ConfigAgent.refreshWith(fronts)
    Await.result(refresh, 1.seconds)
  }

  "getConfigsUsingCollectionId" should "return paths for *all* fronts which contain the specified collection" in {
    ConfigAgent.getConfigsUsingCollectionId("ghi") should be(List("front-1", "front-2"))
  }

  "getConfigsUsingCollectionId" should "*only* return paths for fronts which contain the specified collection" in {
    ConfigAgent.getConfigsUsingCollectionId("abc") should be(List("front-1"))
  }

}
