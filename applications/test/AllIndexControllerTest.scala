package test

import common.Logging
import org.joda.time.DateTimeZone
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.test.Helpers._

@DoNotDiscover class AllIndexControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  private val PermanentRedirect = 301
  private val TemporaryRedirect = 302
  private val OK = 200

  it should "render /all pages with UTC date for any region" in {
    val dayOfWeekEx = """<span class=.*js-dayofweek">[\s]*Thursday[\s]*<\/span>""".r
    val dayOfMonthEx = """<span class=.*js-dayofmonth">[\s]*11[\s]*<\/span>""".r
    val todayMonthEx = """<span class=.*fc-today__month">[\s]*June[\s]*<\/span>""".r
    val todayYearEx = """<span class=.*fc-today__year">[\s]*2009[\s]*<\/span>""".r

    AU("/sport/lawrence-donegan-golf-blog/2009/jun/11/all") { browser =>
      import browser._
      url() should endWith("/sport/lawrence-donegan-golf-blog/2009/jun/11/all?_edition=AU")
      dayOfWeekEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
      dayOfMonthEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
      todayMonthEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
      todayYearEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
    }

    UK("/sport/lawrence-donegan-golf-blog/2009/jun/11/all") { browser =>
      import browser._
      url() should endWith("/sport/lawrence-donegan-golf-blog/2009/jun/11/all")
      dayOfWeekEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
      dayOfMonthEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
      todayMonthEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
      todayYearEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
    }

    US("/sport/lawrence-donegan-golf-blog/2009/jun/11/all") { browser =>
      import browser._
      url() should endWith("/sport/lawrence-donegan-golf-blog/2009/jun/11/all?_edition=US")
      dayOfWeekEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
      dayOfMonthEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
      todayMonthEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
      todayYearEx.findFirstIn(browser.pageSource()).nonEmpty should be(true)
    }
  }

  it should "redirect dated tag pages to the equivalent /all page" in {
    val result = controllers.AllIndexController.on("football/series/thefiver/2014/jan/23")(TestRequest())
    status(result) should be(PermanentRedirect)
    header("Location", result).head should endWith ("/football/series/thefiver/2014/jan/23/all")
  }

  it should "redirect dated section pages to the equivalent /all page" in {
    val result = controllers.AllIndexController.on("football/2014/jan/23")(TestRequest())
    status(result) should be(PermanentRedirect)
    header("Location", result).head should endWith ("/football/2014/jan/23/all")
  }

  it should "redirect to the first earlier page for the given date" in {
    val result = controllers.AllIndexController.altDate("sport/cycling", "25", "dec", "2013")(TestRequest())
    status(result) should be(TemporaryRedirect)
    header("Location", result).head should endWith ("/sport/cycling/2013/dec/26/all")
  }

  it should "redirect to the first older page for the date" in {
    val result = controllers.AllIndexController.allOn("sport/cycling", "25", "dec", "2013")(TestRequest())
    status(result) should be(TemporaryRedirect)
    header("Location", result).head should endWith ("/sport/cycling/2013/dec/23/all")
  }

  it should "redirect without getting into a redirect loop for the US edition" in {
    val oldTimezone = DateTimeZone.getDefault
    DateTimeZone.setDefault(DateTimeZone.UTC)
    try {
      val result = controllers.AllIndexController.allOn("sport/surfing", "16", "aug", "2014")(TestRequest().withHeaders("X-Gu-Edition" -> "US"))
      status(result) should be(TemporaryRedirect)
      header("Location", result).head should endWith ("/sport/surfing/2014/aug/14/all")
    } finally {
      DateTimeZone.setDefault(oldTimezone)
    }
  }

  it should "correctly serve all pages for `default editionalised sections` in the International edition" in {
    val result = controllers.AllIndexController.all("commentisfree")(TestRequest("/commentisfree/all").withHeaders("X-Gu-Edition" -> "INT"))
    println(header("location", result))
    status(result) should be(OK)
  }

  it should "correctly parse the date" in {
    //this would only error in UTC
    val oldTimezone = DateTimeZone.getDefault
    DateTimeZone.setDefault(DateTimeZone.UTC)
    try {
      val result = controllers.AllIndexController.allOn("sport/surfing", "12", "jul", "2014")(TestRequest())
      status(result) should be(OK)
    } finally {
      DateTimeZone.setDefault(oldTimezone)
    }
  }
}
