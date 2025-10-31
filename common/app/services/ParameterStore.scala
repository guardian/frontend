package services

import software.amazon.awssdk.services.ssm.SsmClient
import software.amazon.awssdk.services.ssm.model.{GetParameterRequest, GetParametersByPathRequest}
import software.amazon.awssdk.regions.Region
import common.GuardianConfiguration
import conf.Configuration
import utils.AWSv2

import scala.annotation.tailrec
import scala.jdk.CollectionConverters._

class ParameterStore(region: String) {

  private lazy val client: SsmClient =
    SsmClient.builder().credentialsProvider(AWSv2.credentials).region(Region.of(region)).build()

  def get(key: String): String = {
    val parameterRequest = GetParameterRequest.builder().withDecryption(true).name(key).build()
    client.getParameter(parameterRequest).parameter().value()
  }

  def getPath(path: String, isRecursiveSearch: Boolean = false): Map[String, String] = {

    @tailrec
    def pagination(accum: Map[String, String], nextToken: Option[String]): Map[String, String] = {
      val baseBuilder =
        GetParametersByPathRequest.builder().path(path).withDecryption(true).recursive(isRecursiveSearch)
      val parameterRequest = nextToken.fold(baseBuilder)(baseBuilder.nextToken).build()
      val response = client.getParametersByPath(parameterRequest)
      val resultMap = response
        .parameters()
        .asScala
        .map { param => param.name() -> GuardianConfiguration.unwrapQuotedString(param.value()) }
        .toMap
      Option(response.nextToken()) match {
        case Some(next) if next.nonEmpty => pagination(accum ++ resultMap, Some(next))
        case _                           => accum ++ resultMap
      }
    }

    pagination(Map.empty, None)
  }
}
