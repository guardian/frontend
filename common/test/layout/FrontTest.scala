package layout

import java.time.ZoneOffset
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichOffsetDateTime
import com.gu.facia.api.{models => fapi}
import com.gu.facia.api.utils._
import contentapi.FixtureTemplates.emptyApiContent
import implicits.Dates.jodaToJavaInstant
import model.pressed.{LatestSnap, PressedContent}
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}
import org.scalatestplus.play.guice.GuiceOneAppPerSuite
import services.FaciaContentConvert
import slices._

class FrontTest extends FlatSpec with Matchers with GuiceOneAppPerSuite {
  def trailWithUrl(theUrl: String): PressedContent = {
    FaciaContentConvert.contentToFaciaContent(emptyApiContent.copy(id = theUrl, webUrl = theUrl))
  }

  def dreamSnapWithUrl(theUrl: String): LatestSnap = {

    val offsetDate = jodaToJavaInstant(new DateTime()).atOffset(ZoneOffset.UTC)

    val content: ApiContent = ApiContent(
      id = theUrl,
      sectionId = None,
      sectionName = None,
      webPublicationDate = Some(offsetDate.toCapiDateTime),
      webTitle = "",
      webUrl = theUrl,
      apiUrl = "",
      fields = None,
      tags = Nil,
      elements = None,
      references = Nil,
      isExpired = None)

    val fapiLatestSnap = fapi.LatestSnap(
      id = theUrl,
      maybeFrontPublicationDate = None,
      cardStyle = DefaultCardstyle,
      snapUri = None,
      snapCss = None,
      latestContent = Option(content),
      headline = None,
      href = None,
      trailText = None,
      group = "",
      image = None,
      properties = ContentProperties.fromResolvedMetaData(ResolvedMetaData.Default),
      byline = None,
      kicker = None,
      brandingByEdition = Map.empty
    )

    LatestSnap.make(fapiLatestSnap)
  }

  "itemsVisible" should "return a correct count of items visible (not behind 'show more')" in {
    Front.itemsVisible(FixedContainers.fixedMediumFastXI) shouldEqual 11
    Front.itemsVisible(FixedContainers.fixedMediumSlowVII) shouldEqual 7
    /** Don't know why this is called 12 when it contains 9 items ... */
    Front.itemsVisible(FixedContainers.fixedMediumSlowXIIMpu) shouldEqual 9
  }

}
