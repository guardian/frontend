package services

import com.amazonaws.services.simplesystemsmanagement.model.{GetParameterRequest, GetParametersByPathRequest}
import com.amazonaws.services.simplesystemsmanagement.{
  AWSSimpleSystemsManagement,
  AWSSimpleSystemsManagementClientBuilder,
}
import common.GuardianConfiguration
import conf.Configuration

import scala.annotation.tailrec
import scala.jdk.CollectionConverters._

class ParameterStore(region: String) {

  private lazy val client: AWSSimpleSystemsManagement = Configuration.aws.credentials
    .map { credentials =>
      AWSSimpleSystemsManagementClientBuilder
        .standard()
        .withCredentials(credentials)
        .withRegion(region)
        .build()
    }
    .getOrElse(throw new RuntimeException("Failed to initialize AWSSimpleSystemsManagement"))

  def get(key: String): String = {
    val parameterRequest = new GetParameterRequest().withWithDecryption(true).withName(key)
    client.getParameter(parameterRequest).getParameter.getValue
  }

  def getPath(path: String, isRecursiveSearch: Boolean = false): Map[String, String] = {

    @tailrec
    def pagination(accum: Map[String, String], nextToken: Option[String]): Map[String, String] = {

      val parameterRequest = new GetParametersByPathRequest()
        .withWithDecryption(true)
        .withPath(path)
        .withRecursive(isRecursiveSearch)

      val parameterRequestWithNextToken = nextToken.map(parameterRequest.withNextToken).getOrElse(parameterRequest)

      val result = client.getParametersByPath(parameterRequestWithNextToken)

      val resultMap = result.getParameters.asScala.map { param =>
        param.getName -> GuardianConfiguration.unwrapQuotedString(param.getValue)
      }.toMap

      Option(result.getNextToken) match {
        case Some(next) => pagination(accum ++ resultMap, Some(next))
        case None       => accum ++ resultMap
      }
    }

    pagination(Map.empty, None)
  }
}
