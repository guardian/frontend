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

  val remoteMode = optionalProperty("tests.mode").contains("remote")
  val baseUrl = optionalProperty("tests.baseUrl").getOrElse("http://www.theguardian.com")

  object stack {
    lazy val userName = mandatoryProperty("stack.userName")
    lazy val automateKey = mandatoryProperty("stack.automateKey")
  }

  private def mandatoryProperty(key: String) = Option(properties.getProperty(key)).getOrElse(
    throw new RuntimeException(s"property not found $key")
  )

  private def optionalProperty(key: String) = Option(properties.getProperty(key))

}
