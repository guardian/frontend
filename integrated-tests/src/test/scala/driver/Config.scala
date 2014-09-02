package driver

import java.io.{FileInputStream, File}
import java.util.Properties

object Config {

  private val userConfig = new File(s"${System.getProperty("user.home")}/.gu/integrated-tests.properties")
  private val machineConfig = new File(s"/etc/gu/integrated-tests.properties")

  private val configFile: Option[File] = if (machineConfig.exists()) {
    Some(machineConfig)
  } else if (userConfig.exists()) {
    Some(userConfig)
  } else {
    None
  }

  private val properties = {
    val props =new Properties()
    configFile.foreach(file => props.load(new FileInputStream(file)))
    props
  }

  val remoteMode = Option(properties.getProperty("tests.mode")).contains("remote")
  val baseUrl = Option(properties.getProperty("tests.baseUrl")).getOrElse("http://www.theguardian.com")

  object browserStack {
    lazy val userName = Option(properties.getProperty("browserStack.userName")).getOrElse(
      throw new RuntimeException("property not found browserStack.userName")
    )

    lazy val automateKey = Option(properties.getProperty("browserStack.automateKey")).getOrElse(
      throw new RuntimeException("property not found browserStack.automateKey")
    )
  }

}
