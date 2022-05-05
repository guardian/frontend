package common

import org.scalatest.matchers.should.Matchers
import views.support.{WitnessCleaner, withJsoup}
import play.twirl.api.Html
import org.scalatest.flatspec.AnyFlatSpec

class WitnessCleanerTest extends AnyFlatSpec with Matchers {

  "Witness cleaner" should "not remove video embeds" in {

    val html: Html = withJsoup(
      """<body>
        | <figure class="element element-witness element-witness-image" itemscope itemtype="http://schema.org/ImageObject">
        |    Some image content
        |  </figure>
        |  <figure class="element element-witness element-witness-video" itemscope itemtype="http://schema.org/VideoObject">
        |    Some video content
        |  </figure>
        | </body>""".stripMargin,
    ) { WitnessCleaner }

    html.body should include("element-witness-video")
    html.body should include("Some video content")
  }
}
