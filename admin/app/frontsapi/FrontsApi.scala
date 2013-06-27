package frontsapi

import com.redis.RedisClient
import com.redis.serialization.{Format, Parse}

trait FrontsApi {
  def getList(listName: String): List[String]

  def removeItem(listName: String, value: String): Option[Long]
  def removeList(listName: String): Long

  def addBefore(listName: String, pivot: String, value: String): Long
  def addAfter(listName: String, pivot: String, value: String): Long
  def addAtPosition(listName: String, position: Int, value: String): Boolean
}

class FrontsApiRedis(redisClient: CustomRedisClient) extends FrontsApi {

  def getList(listName: String) = redisClient.lrange(listName, 0 ,-1) map {_.flatten} getOrElse Nil

  def push(listName: String, value: String) = redisClient.lpush(listName, value)

  def removeList(listName: String) = redisClient.del(listName) getOrElse 0L
  def removeItem(listName: String, value: String) = redisClient.lrem(listName, 0, value)

  def addAtPosition(listName: String, position: Int, value: String) = redisClient.lset(listName, position, value)

  //Library does not seem to have LINSERT yet
  def addBefore(listName: String, pivot: String, value: String) = redisClient.linsert(listName, "BEFORE", pivot, value) getOrElse 0L
  def addAfter(listName: String, pivot: String, value: String) = redisClient.linsert(listName, "AFTER", pivot, value) getOrElse 0L

}

class CustomRedisClient(address: String, port: Int) extends RedisClient(address, port) {
  def linsert(key: Any, position: Any, pivot: Any, value: Any)(implicit format: Format): Option[Long] =
    send("LINSERT", List(key, position, pivot, value))(asLong)
}

object FrontsApi extends FrontsApiRedis(new CustomRedisClient("localhost", 6379))