package com.gu.fronts.integration.test.page.util

import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.StringTokenizer
import NetworkFrontDate._
import scala.reflect.{ BeanProperty, BooleanBeanProperty }

object NetworkFrontDate {
  private val DATE_FORMAT = "yyyyMMMMdd"
}

class NetworkFrontDate(networkFrontDateBoxText: String) {

  val stokenizer = new StringTokenizer(networkFrontDateBoxText)

  if (stokenizer.countTokens() < 4) {
    throw new RuntimeException("Could not parse date: " + networkFrontDateBoxText + " due to expecting 4 elements but found: " + stokenizer.countTokens())
  }
    
  @BeanProperty
  var dayOfWeek: String = stokenizer.nextToken()

  private var dayOfMonth: String = stokenizer.nextToken()

  private var month: String = stokenizer.nextToken()

  private var year: String = stokenizer.nextToken()

  def parseToDate(): Date = {
    new SimpleDateFormat(DATE_FORMAT).parse(year + month + dayOfMonth)
  }

  override def toString(): String = {
    "NetworkFrontDate [dayOfWeek=" + dayOfWeek + ", dayOfMonth=" + dayOfMonth + ", month=" + month + ", year=" + year + "]"
  }
}