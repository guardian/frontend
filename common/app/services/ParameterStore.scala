package services

import com.amazonaws.services.simplesystemsmanagement.model._
import com.amazonaws.services.simplesystemsmanagement.{AWSSimpleSystemsManagement, AWSSimpleSystemsManagementClientBuilder}
import common.{GuardianConfiguration, StopWatch}
import conf.Configuration

import scala.collection.JavaConverters._

class ParameterStore(region: String) {

  // Only possible to retrieve 10 results at a time when this was written
  private val MAX_RESULTS = 10

  private lazy val client: AWSSimpleSystemsManagement = Configuration.aws.credentials.map { credentials =>
    AWSSimpleSystemsManagementClientBuilder
      .standard()
      .withCredentials(credentials)
      .withRegion(region)
      .build()
  }.getOrElse(throw new RuntimeException("Failed to initialize AWSSimpleSystemsManagement"))

  def get(key: String): String = {
    val parameterRequest = new GetParameterRequest().withWithDecryption(true).withName(key)
    client.getParameter(parameterRequest).getParameter.getValue
  }

  private def parametersToMap(parameters: java.util.List[Parameter]) = {
    parameters.asScala.map { param =>
      param.getName -> GuardianConfiguration.unwrapQuotedString(param.getValue)
    }.toMap
  }

  def getAll(keys: Seq[String]): Map[String, String] = {
    def getKeys(keys: Seq[String]): Map[String, String] = {
      val parameterRequest = new GetParametersRequest().withWithDecryption(true).withNames(keys: _*)
      client.getParameters(parameterRequest).getParameters.asScala.map { param =>
        param.getName -> GuardianConfiguration.unwrapQuotedString(param.getValue)
      }.toMap

    }
    val result = keys.grouped(MAX_RESULTS).map(getKeys).fold(Map.empty)(_ ++ _)
    if (result.size != keys.size) throw new RuntimeException(s"Could not load all properties from parameter store, ${keys.diff(result.values.toList)}")
    result
  }
}

