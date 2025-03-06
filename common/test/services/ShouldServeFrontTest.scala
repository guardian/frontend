package services

import com.gu.facia.client.models.{Branded, CollectionConfigJson, ConfigJson, FrontJson}
import model.{ApplicationContext, ApplicationIdentity}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.BeforeAndAfterAll
import org.scalatest.matchers.should.Matchers
import play.api.Environment
import test.WithTestApplicationContext

import scala.concurrent.duration._
import scala.concurrent.Await

class ShouldServeFrontTest
    extends AnyFlatSpec
    with Matchers
    with WithTestApplicationContext
    with ScalaFutures
    with BeforeAndAfterAll {

  val fronts = ConfigJson(
    Map(
      "editorial-front" -> FrontJson(
        collections = List("e59785e9-ba82-48d8-b79a-0a80b2f9f808"),
        navSection = None,
        webTitle = None,
        title = None,
        description = None,
        onPageDescription = None,
        imageUrl = None,
        imageWidth = None,
        imageHeight = None,
        isImageDisplayed = None,
        priority = Some("editorial"),
        isHidden = None,
        canonical = Some("e59785e9-ba82-48d8-b79a-0a80b2f9f808"),
        group = Some("US professional"),
      ),
      "hidden-editorial-front" -> FrontJson(
        collections = List("e59785e9-ba82-48d8-b79a-0a80b2f9f808"),
        navSection = None,
        webTitle = None,
        title = None,
        description = None,
        onPageDescription = None,
        imageUrl = None,
        imageWidth = None,
        imageHeight = None,
        isImageDisplayed = None,
        priority = Some("editorial"),
        isHidden = Some(true),
        canonical = Some("e59785e9-ba82-48d8-b79a-0a80b2f9f808"),
        group = Some("US professional"),
      ),
    ),
    Map(
      "e59785e9-ba82-48d8-b79a-0a80b2f9f808" -> CollectionConfigJson(
        displayName = Some("sc johnson partner zone"),
        backfill = None,
        metadata = Some(List(Branded)),
        `type` = Some("fixed/large/slow-XIV"),
        href = None,
        description = None,
        groups = None,
        uneditable = None,
        showTags = None,
        showSections = None,
        hideKickers = None,
        showDateHeader = None,
        showLatestUpdate = None,
        excludeFromRss = None,
        showTimestamps = None,
        hideShowMore = None,
        displayHints = None,
        platform = None,
        frontsToolSettings = None,
        userVisibility = None,
        targetedTerritory = None,
      ),
    ),
  )

  override def beforeAll(): Unit = {
    val refresh = ConfigAgent.refreshWith(fronts)
    Await.result(refresh, 3.seconds)
  }

  "shouldServeFront" should "not serve the front if the front is not in the config JSON" in {
    ConfigAgent.shouldServeFront("nonexistent-front") should be(false)
  }

  it should "not serve a hidden editorial front" in {
    ConfigAgent.shouldServeFront("hidden-editorial-front") should be(false)
  }

  it should "serve a hidden front in preview mode" in {
    val previewContext = ApplicationContext(Environment.simple(), ApplicationIdentity("preview"))
    ConfigAgent.shouldServeFront("hidden-editorial-front")(previewContext) should be(true)
  }
}
