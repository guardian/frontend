package views.support

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{Matchers, FlatSpec}

class FormStackCleanerTest extends FlatSpec with Matchers {

  "FormStackCleaner" should "attach an element-formstack class to formstack iframes" in {
    val doc = """<html><body><figure><iframe src="https://guardiannewsampampmedia.formstack.com/form" /></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = FormStackCleaner.clean(document)

    result.getElementsByClass("element-formstack") should not be empty

  }
}
