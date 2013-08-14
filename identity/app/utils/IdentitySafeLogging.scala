package utils

import org.slf4j.spi.LocationAwareLogger
import org.slf4j.ext.LoggerWrapper
import org.slf4j.{LoggerFactory, Marker}
import scala.util.matching.Regex

class IdentitySafeLogger(wrappedLogger: LocationAwareLogger, classname : String)
  extends LoggerWrapper(
    new LoggerWrapper(wrappedLogger, classname) with LocationAwareLogger {

      def getVariableMatcher(name: String): Regex = {
        // lookbehind to check format is [&?]name=<value> then match the value, a chunk of url-safe chars
        ("(?<=[&?]" + name + "=)[^&,# +:=/]+").r
      }

      val patterns = List(
        getVariableMatcher("accessToken"),
        getVariableMatcher("password"),
        getVariableMatcher("email"),
        getVariableMatcher("trackingUserAgent"),
        getVariableMatcher("trackingIpAddress")
      )

      def makeSafe(msg : String) : String = {
        patterns.foldLeft(msg){ case (filteredMsg, pattern) =>
          pattern.replaceAllIn(filteredMsg, "***")
        }
      }

      def log(marker: Marker, fqcn: String, level: Int, message: String, argArray: Array[AnyRef], t: Throwable) {
        wrappedLogger.log(marker, fqcn, level, makeSafe(message), argArray, t)
      }
    }, classname)


trait SafeLogging {
  val logger = new IdentitySafeLogger(LoggerFactory.getLogger(getClass).asInstanceOf[LocationAwareLogger], getClass.getName)
}
object SafeLogging extends SafeLogging