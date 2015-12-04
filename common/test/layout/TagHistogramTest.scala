package layout

import com.gu.contentapi.client.model.Tag
import contentapi.FixtureTemplates
import model.Content
import org.scalatest.{Matchers, FlatSpec}

class TagHistogramTest extends FlatSpec with Matchers {
  def tag(id: String) =
    FixtureTemplates.emptyTag.copy(id = id)

  def trailWithTags(tags: List[Tag]) =
    Content(FixtureTemplates.emptyApiContent.copy(tags = tags)).trail

  "frequency" should "return 0 for any unrecorded tag ID" in {
    TagHistogram.fromTrails(Seq(
      trailWithTags(List(
        tag("sport/cycling")
      ))
    )).frequency("sport/football") shouldEqual 0
  }

  it should "not throw a divide by zero error if passed no trails" in {
    TagHistogram.fromTrails(Seq.empty).frequency("sport/football") shouldEqual 0
  }

  it should "correctly record frequencies" in {
    val histogram = TagHistogram.fromTrails(Seq(
      trailWithTags(List(
        tag("sport/cycling")
      )),
      trailWithTags(List(
        tag("sport/football"),
        tag("sport/cycling")
      )),
      trailWithTags(List(
        tag("profile/robert-berry")
      ))
    ))

    histogram.frequency("sport/cycling") shouldEqual (2.0 / 3)
    histogram.frequency("sport/football") shouldEqual (1.0 / 3)
    histogram.frequency("profile/robert-berry") shouldEqual (1.0 / 3)
  }
}
