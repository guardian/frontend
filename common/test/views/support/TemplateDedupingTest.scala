package views.support

import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}
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

  it should "not remove duplicates if it was not within what was asked" in {
    val newTrailsOne = dedupe.take(2, trails)
    newTrailsOne.length should be (4)
    newTrailsOne should be (trails)

    val newTrailsTwo = dedupe.take(2, trails)
    newTrailsTwo.length should be (2)
    newTrailsTwo(0) shouldEqual trailThree
    newTrailsTwo(1) shouldEqual trailFour
  }

  it should "dedupe all of the trails passed by default" in {
    val newTrailsOne = dedupe.apply(Collection(trails))
    newTrailsOne.items.length should be (4)

    val newTrailsTwo = dedupe.apply(Collection(trails))
    newTrailsTwo.items.length should be (0)
  }

  it should "respect deduping boundaries" in {
    val newTrailsOne = dedupe.take(1, Collection(trails))
    newTrailsOne.items.length should be (4)
    newTrailsOne.items should be (Seq(trailOne, trailTwo, trailThree, trailFour))

    val newTrailsTwo = dedupe.take(1, Collection(trails))
    newTrailsTwo.items.length should be (3)
    newTrailsTwo.items should be (Seq(trailTwo, trailThree, trailFour))

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
    val newTrailsOne = dedupe.take(1, Collection(trails))
    newTrailsOne.items.length should be (4)
    newTrailsOne.items should be (Seq(trailOne, trailTwo, trailThree, trailFour))

    val newTrailsTwo = dedupe.take(1, Collection(trails))
    println("BeforeTestOne: " + newTrailsTwo.items.map(_.url).mkString(","))
    newTrailsTwo.items.length should be (3)
    newTrailsTwo.items should be (Seq(trailTwo, trailThree, trailFour))

    val newTrailsThree = dedupe.take(1, Collection(trails))
    println("BeforeTestTwo: " + newTrailsThree.items.map(_.url).mkString(","))
    newTrailsThree.items.length should be (2)
    newTrailsThree.items should be (Seq(trailThree, trailFour))

    val newTrailsFour = dedupe.take(1, Collection(trails))
    newTrailsFour.items.length should be (1)
    newTrailsFour.items should be (Seq(trailFour))

    val newTrailsFive = dedupe.take(1, Collection(trails))
    newTrailsFive.items.length should be (0)
  }
}

case class TestTrail(url: String) extends Trail {
  def webPublicationDate: DateTime = DateTime.now
  def linkText: String = ""
  def headline: String = ""
  def trailText: Option[String] = None
  def section: String = ""
  def sectionName: String = ""
  def isLive: Boolean = true

  override def delegate = ApiContent("foo/2012/jan/07/bar", None, None, new DateTime, "Some trail",
    "http://www.guardian.co.uk/foo/2012/jan/07/bar",
    "http://content.guardianapis.com/foo/2012/jan/07/bar",
    elements = None,
    fields = None)
}