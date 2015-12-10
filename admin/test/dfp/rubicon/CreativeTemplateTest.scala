package dfp.rubicon

import org.scalatest.{FlatSpec, Matchers}

class CreativeTemplateTest extends FlatSpec with Matchers {

  "relabel" should "leave unique labels alone" in {
    CreativeTemplate.relabel(Seq("a" -> "1", "b" -> "2", "c" -> "3")) shouldBe Seq("a" -> "1", "b" -> "2", "c" -> "3")
  }

  it should "relabel duplicate parameters" in {
    CreativeTemplate.relabel(Seq("a" -> "1", "a" -> "2", "a" -> "3", "b" -> "4")) shouldBe
    Seq("a" -> "1", "a.1" -> "2", "a.2" -> "3", "b" -> "4")
  }
}
