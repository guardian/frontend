package test

import org.scalatest.Matchers
import org.scalatest.FlatSpec
import scala.collection.JavaConversions._

class SectionTemplateTest extends FlatSpec with Matchers {

  it should "render front title" in HtmlUnit("/uk-news") { browser =>
    import browser._
    $(".container__title").first.getText should be ("UK news")
  }

  it should "render section navigation" in  HtmlUnit("/books") { browser =>
      import browser._
      val navigation = findFirst("[itemtype='http://data-vocabulary.org/Breadcrumb']")
      navigation.findFirst("[itemprop='url']").getAttribute("href") should endWith ("/uk/culture")
      navigation.find("[itemprop='url']")(1).getAttribute("href") should endWith ("/books")
  }
}
