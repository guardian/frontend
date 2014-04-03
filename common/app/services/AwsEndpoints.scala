package services

object AwsEndpoints {
  import conf.Configuration.aws
  lazy val sns: String = s"sns.${aws.region}.amazonaws.com"
  lazy val elb: String = s"elasticloadbalancing.${aws.region}.amazonaws.com"
  lazy val monitoring: String = s"monitoring.${aws.region}.amazonaws.com"
  lazy val dynamoDb: String = s"dynamodb.${aws.region}.amazonaws.com"
  lazy val s3: String = s"s3-${aws.region}.amazonaws.com"
}
