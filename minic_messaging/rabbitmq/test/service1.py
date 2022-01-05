from minic_messaging.rabbitmq.adapter import RabbitmqBlockingExchangeAdapter, RabbitmqBlockingTaskQueueAdapter
import time

if __name__ == "__main__":
    adapter1 = RabbitmqBlockingExchangeAdapter()
    adapter1.subscribe("service2", "minic12", "minic21", "topic", ["#"])
    adapter1.subscribe("service3", "minic13", "minic31", "topic", ["#"])

    adapter2 = RabbitmqBlockingTaskQueueAdapter()
    adapter2.prepare_dispatcher('task-queue')

    counter = 0

    while True:
        time.sleep(1)
        adapter1.publish("service2", "minic12", "#", "hello from 1")
        adapter1.publish("service3", "minic13", "#", "hello from 1")
        adapter2.publish("task-queue", f"work - {counter}")
        counter += 1