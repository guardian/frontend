package pagepresser

import org.jsoup.Jsoup
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.DoNotDiscover
import test.ConfiguredTestSuite

import scala.io.Source

@DoNotDiscover class InteractiveHtmlCleanerTest extends AnyFlatSpec with Matchers with ConfiguredTestSuite {

  "InteractiveHtmlCleaner" should "remove all non-interactive scripts and re-write jQuery when pressing a page" in {
    val originalSource = Source.fromInputStream(
      getClass.getClassLoader.getResourceAsStream("pagepresser/r2/interactivePageWithJQuery.html"),
    )
    val originalDoc = Jsoup.parse(originalSource.mkString)

    val expectedCleanedDocFromSource = Source.fromInputStream(
      getClass.getClassLoader
        .getResourceAsStream("pagepresser/r2/interactivePageWithScriptsRemovedAndJQueryRetained.html"),
    )
    val expectedDoc = Jsoup.parse(expectedCleanedDocFromSource.mkString);

    val actualResult = InteractiveHtmlCleaner.removeScripts(originalDoc);
    actualResult.toString().replaceAll("\\s+", "") should be(expectedDoc.toString().replaceAll("\\s+", ""))
  }

}
