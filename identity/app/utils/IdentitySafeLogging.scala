package utils

import org.slf4j.spi.LocationAwareLogger
import org.slf4j.ext.LoggerWrapper
import org.slf4j.{LoggerFactory, Marker}
import scala.util.matching.Regex
import client.Logging


class IdentitySafeLogger(wrappedLogger: LocationAwareLogger, classname : String)
  extends LoggerWrapper(
    new LoggerWrapper(wrappedLogger, classname) with LocationAwareLogger {

      def getVariableMatcher(name: String): Regex = {
        // lookbehind to check format is name=<value> then match the value, a chunk of url-safe chars
        ("(?<=" + name + "=)[^&,# :=/]+").r
      }

      def jsonStringMatcher(name: String): Regex = {
        // lookbehind and ahead to check format is "name":"value", matching up to first "
        // does not support " chars in value, but we don't need that
        ("""(?<=["]""" + name + """["]:")[^"]+""").r
      }

      val patterns = List(
        getVariableMatcher("accessToken"),
        getVariableMatcher("password"),
        getVariableMatcher("email"),
        getVariableMatcher("trackingUserAgent"),
        getVariableMatcher("trackingIpAddress"),
        getVariableMatcher("Authorization"),
        getVariableMatcher("ip"),
        jsonStringMatcher("token"),
        jsonStringMatcher("accessToken"),
        jsonStringMatcher("password"),
        jsonStringMatcher("email")
      )

      def cleanString(msg : String): String = {
        patterns.foldLeft(msg){ case (filteredMsg, pattern) =>
          pattern.replaceAllIn(filteredMsg, "***")
        }
      }

      def cleanThrowable(t: Throwable): CleanedException = {
        val message = Option("(" + t.getClass.getName + "): " + t.getMessage).map(cleanString).orNull
        val cause = Option(t.getCause).map(cleanThrowable).orNull
        val cleaned = new CleanedException(message, cause)
        cleaned.setStackTrace(t.getStackTrace)
        cleaned
      }

      override def log(marker: Marker, fqcn: String, level: Int, message: String, argArray: Array[AnyRef], t: Throwable): Unit = {
        wrappedLogger.log(marker, fqcn, level, cleanString(message), argArray, Option(t).map(cleanThrowable).orNull)
      }
    }, classname
  )


trait SafeLogging extends Logging {
  override val logger = new IdentitySafeLogger(LoggerFactory.getLogger(getClass).asInstanceOf[LocationAwareLogger], getClass.getName)
}

class CleanedException(message: String, cause: CleanedException = null) extends Throwable(message, cause)
