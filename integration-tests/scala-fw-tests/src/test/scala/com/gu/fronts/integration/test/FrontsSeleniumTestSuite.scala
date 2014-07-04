package com.gu.fronts.integration.test

import java.io.{ File, FileOutputStream }
import java.util.UUID

import org.joda.time.DateTime
import org.openqa.selenium.{ OutputType, TakesScreenshot, WebDriver }
import org.scalatest.{ BeforeAndAfter, Matchers, Tag }
import org.slf4j.MDC

import com.gu.automation.support.{ Config, WebDriverFeatureSpec }
import com.gu.fronts.integration.test.config.WebdriverFactory

abstract class FrontsSeleniumTestSuite extends WebDriverFeatureSpec with Matchers with PageHelper {

  //all this below is temporary until the framework guys support setting sauce lab job name to test name
  protected def startDriver(testName: String): WebDriver = {
    WebdriverFactory.getSauceLabsWebdriver(testClassMethodName(testName))
  }

  private def testClassMethodName(testName: String): String = {
    getClass().getSimpleName() + "." + testName
  }

  override protected def scenarioWeb(specText: String, testTags: Tag*)(testFun: => Any) {
    scenario(specText, testTags: _*)({ td =>
      sys.props.put("teststash.url", Config().getPluginValue("teststash.url"))
      MDC.put("ID", UUID.randomUUID().toString)
      MDC.put("setName", Config().getProjectName())
      MDC.put("setDate", Config().getTestSetStartTime().getMillis.toString)
      MDC.put("testName", td.name)
      MDC.put("testDate", DateTime.now.getMillis.toString)
      logger.info("[TEST START]") // starts websocket to T-Stash
      logger.info("Test Name: " + td.name)

      driver = startDriver(td.name)
      try {
        testFun
      } catch {
        case e: Exception => failWithScreenshot(td.name, driver, e)
      } finally {
        logger.info("[TEST END]") // closes websocket to T-Stash
        driver.quit()
      }
    })
  }

  private def failWithScreenshot(testName: String, driver: WebDriver, e: Exception) = {
    logger.failure("Test failed")
    try {
      val screenshotFile = driver match {
        case ts: TakesScreenshot => {
          logger.failure("Test failed")
          ts.getScreenshotAs(OutputType.BYTES)
        }
        case _ => throw new RuntimeException("Error getting screenshot")
      }

      val screenshotDir = "logs/screenshots"
      new File(screenshotDir).mkdirs()
      val file = new FileOutputStream(s"${screenshotDir}/${testName}.png")
      file.write(screenshotFile)
      file.close
    } catch {
      case e: Exception => logger.step("Error taking screenshot.")
    }
    throw e
  }
}