package utils

import java.util.concurrent.{Executors, ThreadPoolExecutor, TimeUnit}

object IdentityApiThreadPoolMonitor extends SafeLogging {
  private val scheduler = Executors.newScheduledThreadPool(1)

  def monitorThreadPool(threadPoolExecutor: ThreadPoolExecutor): Unit = {
    scheduler.scheduleAtFixedRate(
      () => {
        logger.info(s"identity API thread pool stats: $threadPoolExecutor")
      },
      60,
      60,
      TimeUnit.SECONDS,
    )
  }
}
