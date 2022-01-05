from minic_messaging.rabbitmq.adapter import RabbitmqBlockingExchangeAdapter, RabbitmqBlockingTaskQueueAdapter
import time

if __name__ == "__main__":
    adapter1 = RabbitmqBlockingExchangeAdapter()
    adapter1.subscribe("service1", "minic21", "minic12", "topic", ["#"])
    adapter1.subscribe("service3", "minic23", "minic32", "topic", ["#"])

    adapter2 = RabbitmqBlockingTaskQueueAdapter()
    adapter2.subscribe("task-queue")

    
    while True:
        time.sleep(1)
        adapter1.publish("service1", "minic21", "#", "hello from 2")
        adapter1.publish("service3", "minic23", "#", "hello from 2")