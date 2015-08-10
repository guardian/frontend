package common.dfp

import org.joda.time.DateTime.now
import org.scalatest.{FlatSpec, Matchers}

class GuCreativeTemplateTest extends FlatSpec with Matchers {

  def creative(id: Long, name: String) = GuCreative(id, name, now.withTimeAtStartOfDay(), Map.empty)

  def template(id: Long, creatives: Seq[GuCreative]) =
    GuCreativeTemplate(id, "name", "description", Nil, "snippet", creatives)

  "merge" should "remove an old template that's not in new list" in {
    val oldTemplates = Seq(template(1, Nil))
    val newTemplates = Nil
    val merged = GuCreativeTemplate.merge(oldTemplates, newTemplates)
    merged shouldBe Nil
  }

  it should "for any template, add old creatives to new creatives in correct order" in {
    val oldTemplates = Seq(template(1, Seq(creative(1, "b"))))
    val newTemplates = Seq(template(1, Seq(creative(2, "a"), creative(3, "c"))))
    val merged = GuCreativeTemplate.merge(oldTemplates, newTemplates)
    merged shouldBe Seq(template(1, Seq(creative(2, "a"), creative(1, "b"), creative(3, "c"))))
  }

  it should "for any template, dedup creatives" in {
    val oldTemplates = Seq(template(1, Seq(creative(1, "a"))))
    val newTemplates = Seq(template(1, Seq(creative(1, "b"))))
    val merged = GuCreativeTemplate.merge(oldTemplates, newTemplates)
    merged shouldBe Seq(template(1, Seq(creative(1, "b"))))
  }
}
