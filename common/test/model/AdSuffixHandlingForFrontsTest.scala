package model

import org.scalatest.{Matchers, FlatSpec}

class AdSuffixHandlingForFrontsTest extends FlatSpec with Matchers  {
  object Tester extends AdSuffixHandlingForFronts {
    override def id: String = ???

    override def section: String = ???

    override def analyticsName: String = ???

    override def webTitle: String = ???
  }

  "Editionalised Network Front pages" should "have editions in the ad unit suffix and end with 'front'" in {
    Tester.extractAdUnitSuffixFrom("uk") should equal("uk/front/ng")
  }

  "Editionalised Section fronts" should "end with front, and do not have editions in the ad unit suffix" in {
    Tester.extractAdUnitSuffixFrom("uk/money") should equal("money/front/ng")
  }

  "Editionalised Tag Fronts" should "end with 'front', and do not have editions in the ad unit suffix" in {
    // While we don't have editionalised tag fronts right now, at least we know it'll work
    Tester.extractAdUnitSuffixFrom("uk/money/borrowing") should equal("money/borrowing/front/ng")
  }

  "Non-editionlised section fronts" should "end with 'front'" in {
    Tester.extractAdUnitSuffixFrom("lifeandstyle") should equal("lifeandstyle/front/ng")
  }

  "Non-editionalised tag fronts" should "end with 'front" in {
    Tester.extractAdUnitSuffixFrom("lifeandstyle/live-better") should equal("lifeandstyle/live-better/front/ng")
  }

}
