package driver

import java.net.URL

import integration.Config
import org.openqa.selenium.WebDriver
import org.openqa.selenium.remote.{DesiredCapabilities, RemoteWebDriver}

object SauceLabsWebDriver {

  def apply(): WebDriver = {
    val capabilities = DesiredCapabilities.firefox()

    // this makes the test name appear in the Saucelabs UI
    val buildNumber = System.getenv().getOrDefault("BUILD_NUMBER", "0")
    capabilities.setCapability("name", s"Integrated Tests Suite $buildNumber")
    val domain = s"${Config.stack.userName}:${Config.stack.automateKey}@ondemand.saucelabs.com"
    val url = s"http://$domain:80/wd/hub"
    new RemoteWebDriver(new URL(url), capabilities)
  }
}
