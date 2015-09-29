package views.support.cleaner

import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.scalatest.{FlatSpec, Matchers}

class CmpParamCleanerTest extends FlatSpec with Matchers {

  "CmpParamCleaner" should "attach an element-pass-cmp class to formstack iframes" in {
    val doc = """<html><body><figure><iframe src="https://guardiannewsampampmedia.formstack.com/form" /></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = CmpParamCleaner.clean(document)

    result.getElementsByClass("element-pass-cmp") should not be empty

  }

  "CmpParamCleaner" should "attach an element-pass-cmp class to formstack wrappers" in {
    val doc = """<html><body><figure><iframe src="https://profile.theguardian.com/form/embed/blahyblah" /></figure></body></html>"""
    val document: Document = Jsoup.parse(doc)
    val result: Document = CmpParamCleaner.clean(document)

    result.getElementsByClass("element-pass-cmp") should not be empty

  }
}
