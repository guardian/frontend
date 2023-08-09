package utils

import software.amazon.awssdk.auth.credentials._
import software.amazon.awssdk.awscore.client.builder.AwsClientBuilder
import software.amazon.awssdk.http.nio.netty.NettyNioAsyncHttpClient
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.regions.Region.EU_WEST_1
import software.amazon.awssdk.services.s3.{S3AsyncClient, S3AsyncClientBuilder}

object AWSv2 {
  val region: Region = EU_WEST_1

  def credentialsForDevAndProd(devProfile: String, prodCreds: AwsCredentialsProvider): AwsCredentialsProviderChain =
    AwsCredentialsProviderChain.of(prodCreds, ProfileCredentialsProvider.builder().profileName(devProfile).build())

  lazy val credentials: AwsCredentialsProvider =
    credentialsForDevAndProd("frontend", InstanceProfileCredentialsProvider.create())

  def build[T, B <: AwsClientBuilder[B, T]](builder: B): T =
    builder.credentialsProvider(credentials).region(region).build()

  val S3Async: S3AsyncClient = build[S3AsyncClient, S3AsyncClientBuilder](
    S3AsyncClient.builder().httpClientBuilder(NettyNioAsyncHttpClient.builder().maxConcurrency(250)),
  )
}
