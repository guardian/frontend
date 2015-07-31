package test

import java.util.concurrent.TimeUnit

import common.Logging
import org.fluentlenium.core.Fluent
import org.joda.time.DateTimeZone
import org.openqa.selenium.By
import org.openqa.selenium.By.ByClassName
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.test.Helpers._

@DoNotDiscover class AllIndexControllerTest extends FlatSpec with Matchers with ConfiguredTestSuite with Logging {

  private val PermanentRedirect = 301
  private val TemporaryRedirect = 302
  private val OK = 200

  override protected def setJavascript() = {
    htmlUnitDriver.setJavascriptEnabled(true)
  }

  it should "render an /all tag page with a UTC timestamp for the UK edition" in goTo("/sport/lawrence-donegan-golf-blog/2009/jun/11/all") { browser =>
    import browser._
    println(s"###! JS enabled: ${htmlUnitDriver.isJavascriptEnabled}")
    url() should endWith("/sport/lawrence-donegan-golf-blog/2009/jun/11/all")
    await().atMost(30, TimeUnit.SECONDS).until(".fc-container__header__title").isPresent
    //    await().atMost(5, TimeUnit.SECONDS).until(".js-dayofweek").isPresent
    //    await().atMost(5, TimeUnit.SECONDS).until(".js-dayofmonth").isPresent
    //    await().atMost(5, TimeUnit.SECONDS).until(".fc-today__month").isPresent
    //    await().atMost(5, TimeUnit.SECONDS).until(".fc-today__year").isPresent

    val fcContainerHeaderTitle = $(".fc-container__header__title").first().getElement

    println(s"### .fc-container__header__title is a ${fcContainerHeaderTitle.getClass.getCanonicalName}")
    println(s"    contains js-dayofweek: ${!fcContainerHeaderTitle.findElements(By.className("js-dayofweek")).isEmpty}")
    val jsDayOfWeekElems = fcContainerHeaderTitle.findElements(By.className("js-dayofweek"))
    println(s"    jsDayOfWeekElems is a ${jsDayOfWeekElems.getClass.getCanonicalName}")
    println(s"    size: ${jsDayOfWeekElems.size()}")
    println("    contents:")
    for(i <- 0 to jsDayOfWeekElems.size() -1) {
      println(s" elem($i) is a ${jsDayOfWeekElems.get(i).getClass.getCanonicalName}")
      println(s" elem($i) text: ${jsDayOfWeekElems.get(i).getText}")
    }

    $(".js-dayofweek").getText should be("Thursday")
    $(".js-dayofmonth").getText should be("10")
    $(".fc-today__month").getText should be("June")
    $(".fc-today__year").getText should be("2009")
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
