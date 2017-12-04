package services

import com.amazonaws.services.simplesystemsmanagement.model.{GetParameterRequest, GetParametersByPathRequest}
import com.amazonaws.services.simplesystemsmanagement.{AWSSimpleSystemsManagement, AWSSimpleSystemsManagementClientBuilder}
import conf.Configuration

import scala.annotation.tailrec
import scala.collection.JavaConverters._

class ParameterStore(region: String) {

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

  def getPath(path: String): Map[String, String] = {

    def unwrapQuotedString(input: String) = {
      val quotedString = "\"(.*)\"".r
      input match {
        case quotedString(content) => content
        case content => content
      }
    }

    @tailrec
    def pagination(accum: Map[String, String], nextToken: Option[String]): Map[String, String] = {

      // Only possible to get a maximum of 10 results when this was written
      val maxResults = 10

      val parameterRequest = new GetParametersByPathRequest()
        .withWithDecryption(true)
        .withPath(path)
        .withRecursive(false)
        .withMaxResults(maxResults)

      val parameterRequestWithNextToken = nextToken.map(parameterRequest.withNextToken).getOrElse(parameterRequest)

      val result = client.getParametersByPath(parameterRequestWithNextToken)

      val resultMap = result.getParameters.asScala.map { param =>
        param.getName -> unwrapQuotedString(param.getValue)
      }.toMap

      Option(result.getNextToken) match {
        case Some(next) => pagination(accum ++ resultMap, Some(next))
        case None => accum ++ resultMap
      }
    }

    pagination(Map.empty, None)
  }
}
