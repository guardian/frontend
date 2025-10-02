package utils

import software.amazon.awssdk.auth.credentials._
import software.amazon.awssdk.awscore.client.builder.AwsClientBuilder
import software.amazon.awssdk.http.nio.netty.NettyNioAsyncHttpClient
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.regions.Region.EU_WEST_1
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.{S3AsyncClient, S3AsyncClientBuilder, S3Client, S3ClientBuilder}
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.sts.auth.StsAssumeRoleCredentialsProvider
import software.amazon.awssdk.services.sts.model.AssumeRoleRequest
import software.amazon.awssdk.services.sts.{StsClient, StsClientBuilder}

object AWSv2 {
  val region: Region = EU_WEST_1

  def credentialsForDevAndProd(devProfile: String, prodCreds: AwsCredentialsProvider): AwsCredentialsProviderChain =
    AwsCredentialsProviderChain.of(prodCreds, ProfileCredentialsProvider.builder().profileName(devProfile).build())

  lazy val credentials: AwsCredentialsProvider =
    credentialsForDevAndProd("frontend", InstanceProfileCredentialsProvider.create())

  def build[T, B <: AwsClientBuilder[B, T]](builder: B, creds: AwsCredentialsProvider = credentials): T =
    builder.credentialsProvider(creds).region(region).build()

  def buildS3AsyncClient(creds: AwsCredentialsProvider): S3AsyncClient = build[S3AsyncClient, S3AsyncClientBuilder](
    S3AsyncClient.builder().httpClientBuilder(NettyNioAsyncHttpClient.builder().maxConcurrency(250)),
    creds,
  )

  val S3Async: S3AsyncClient = buildS3AsyncClient(credentials)

  val S3Sync: S3Client = build[S3Client, S3ClientBuilder](S3Client.builder())

  val S3PresignerSync: S3Presigner = S3Presigner.builder().credentialsProvider(credentials).region(region).build()

  val STS: StsClient = build[StsClient, StsClientBuilder](StsClient.builder())

  def stsCredentials(devProfile: String, roleArn: String): AwsCredentialsProvider = credentialsForDevAndProd(
    devProfile,
    StsAssumeRoleCredentialsProvider
      .builder()
      .stsClient(STS)
      .refreshRequest(AssumeRoleRequest.builder.roleSessionName("frontend").roleArn(roleArn).build)
      .build(),
  )

  val secretsClient = SecretsManagerClient
    .builder()
    .region(region)
    .credentialsProvider(credentials)
    .build()
}
