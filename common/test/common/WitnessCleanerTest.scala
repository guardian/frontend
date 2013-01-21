package common

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import views.support.{ WitnessCleaner, withJsoup }
import play.api.templates.Html
import conf.CommonSwitches

class WitnessCleanerTest extends FlatSpec with ShouldMatchers {

  "Witness cleaner" should "remove video embeds if it is switched off" in {

    CommonSwitches.WitnessVideoSwitch.switchOff()

    val html: Html = withJsoup(
      """<body>
        | <figure class="element element-witness element-witness-image" itemscope itemtype="http://schema.org/ImageObject">
        |    Some image content
        |  </figure>
        |  <figure class="element element-witness element-witness-video" itemscope itemtype="http://schema.org/VideoObject">
        |    Some video content
        |  </figure>
        | </body>""".stripMargin) { WitnessCleaner }

    html.body should not include ("element-witness-video")
    html.body should not include ("Some video content")
  }

  it should "not remove video embeds if it is switched on" in {

    CommonSwitches.WitnessVideoSwitch.switchOn()

    val html: Html = withJsoup(
      """<body>
        | <figure class="element element-witness element-witness-image" itemscope itemtype="http://schema.org/ImageObject">
        |    Some image content
        |  </figure>
        |  <figure class="element element-witness element-witness-video" itemscope itemtype="http://schema.org/VideoObject">
        |    Some video content
        |  </figure>
        | </body>""".stripMargin) { WitnessCleaner }

    html.body should include("element-witness-video")
    html.body should include("Some video content")
  }
}
