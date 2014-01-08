package views.support

import org.scalatest.{Ignore, BeforeAndAfter, FlatSpec, Matchers}
import model.{Collection, Trail}
import org.joda.time.DateTime
import com.gu.openplatform.contentapi.model.{Content => ApiContent}

class TemplateDedupingTest extends FlatSpec with Matchers with BeforeAndAfter {

  val trailOne = new TestTrail("uk/news/one")
  val trailTwo = new TestTrail("uk/news/two")
  val trailThree = new TestTrail("uk/news/three")
  val trailFour = new TestTrail("uk/news/four")
  val trails = Seq(trailOne, trailTwo, trailThree, trailFour)

  val trailFive = new TestTrail("uk/news/five")

  var dedupe: TemplateDeduping = null
  before {
    dedupe = new TemplateDeduping
  }

  "Trails" should "equal each other" in {
    val tempTrailOne = TestTrail("one/two/three")
    val tempTrailTwo = TestTrail("one/two/three")

    tempTrailOne shouldEqual tempTrailTwo
  }

  "TemplateDeduping" should "remove duplicates" in {
    val duplicateTrail = TestTrail("uk/news/two")
    val newTrails = dedupe.take(5, trails :+ duplicateTrail)

    newTrails.length should be (4)
    newTrails(1) shouldEqual trailTwo
    newTrails(3) shouldEqual trailFour
  }

  it should "correctly dedupe items not already deduped" in {
    val newTrailsOne = dedupe.take(2, trails)
    newTrailsOne.length should be (4)
    newTrailsOne should be (trails)

    val newTrailsTwo = dedupe.take(2, trails)
    newTrailsTwo.length should be (2)
    newTrailsTwo(0) shouldEqual trailThree
    newTrailsTwo(1) shouldEqual trailFour
  }

  it should "dedupe all of the trails passed by default" in {
    val newTrailsOne = dedupe.apply(trails)
    newTrailsOne.length should be (4)

    val newTrailsTwo = dedupe.apply(trails)
    newTrailsTwo.length should be (0)
  }

  it should "respect deduping boundaries" in {
    val newTrailsOne = dedupe.take(1, trails)
    newTrailsOne.length should be (4)
    newTrailsOne should be (Seq(trailOne, trailTwo, trailThree, trailFour))

    val newTrailsTwo = dedupe.take(1, trails)
    newTrailsTwo.length should be (3)
    newTrailsTwo should be (Seq(trailTwo, trailThree, trailFour))

    //trailTwo and trailOne have been deduped above, but are not in the deduping zone here
    //so they should not be deduped and we should get 4 back
    val newTrailSeq = Seq(trailFour, trailThree, trailTwo, trailOne)
    val newTrailsThree = dedupe.take(2, newTrailSeq)
    newTrailsThree.length should be (4)
    newTrailsThree should be (Seq(trailFour, trailThree, trailTwo, trailOne))

    val newTrailSeqTwo = Seq(trailFive) ++ newTrailSeq
    val newTrailsFour = dedupe.take(1, newTrailSeqTwo)
    newTrailsFour.length should be (5)
  }

  it should "not return anything in the end" in {
    val newTrailsOne = dedupe.take(1, trails)
    newTrailsOne.length should be (4)
    newTrailsOne should be (Seq(trailOne, trailTwo, trailThree, trailFour))

    val newTrailsTwo = dedupe.take(1, trails)
    newTrailsTwo.length should be (3)
    newTrailsTwo should be (Seq(trailTwo, trailThree, trailFour))

    val newTrailsThree = dedupe.take(1, trails)
    newTrailsThree.length should be (2)
    newTrailsThree should be (Seq(trailThree, trailFour))

    val newTrailsFour = dedupe.take(1, trails)
    newTrailsFour.length should be (1)
    newTrailsFour should be (Seq(trailFour))

    val newTrailsFive = dedupe.take(1, trails)
    newTrailsFive.length should be (0)
  }

  it should "preserve order" in {
    val newTrailsOne = dedupe.take(1, Seq(trailThree))
    newTrailsOne.length should be (1)

    val newTrailsTwo = dedupe.take(3, Seq(trailOne, trailThree, trailFour))
    newTrailsTwo should be (Seq(trailOne, trailFour))
  }
}

case class TestTrail(url: String) extends Trail {
  def webPublicationDate: DateTime = DateTime.now
  def shortUrl: String = ""
  def linkText: String = ""
  def headline: String = ""
  def webUrl: String = ""
  def trailText: Option[String] = None
  def section: String = ""
  def sectionName: String = ""
  def isLive: Boolean = true
}
