package com.gu.integration.test.util

import org.openqa.selenium.{Cookie, WebDriver}

object CookieUtil {
  def getCookie(cookieName: String)(implicit driver: WebDriver): Cookie = {
    driver.manage().getCookieNamed(cookieName)
  }

  /**
   * Use this to get a secure cookie. Make sure you either are on an HTTPS address or provide one as a param
   */
  def getSecureCookie(secureCookieName: String, secureUrl: Option[String])(implicit driver: WebDriver): Cookie = {
    //have to go to a https link because on some browsers you can only get secure cookies on https pages
    val currentUrl = driver.getCurrentUrl

    if (secureUrl.isDefined) {
      driver.get(secureUrl.get)
    }

    if (!driver.getCurrentUrl.startsWith("https")) {
      throw new RuntimeException(s"You have to be on an HTTPS address to get a secure cookie. Current address: ${driver.getCurrentUrl}")
    }

    val secureLoginCookie = getCookie(secureCookieName)

    //go back to previous link
    if (secureUrl.isDefined) {
      driver.get(currentUrl)
    }

    secureLoginCookie
  }
}
