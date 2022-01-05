from minic_messaging.rabbitmq.adapter import RabbitmqBlockingExchangeAdapter, RabbitmqBlockingTaskQueueAdapter

class Messenger:
    exchange_adaptar: RabbitmqBlockingExchangeAdapter
    task_queue_adaptar: RabbitmqBlockingTaskQueueAdapter

    @classmethod
    def initialize(cls):
        cls.exchange_adaptar = RabbitmqBlockingExchangeAdapter()
        cls.task_queue_adaptar = RabbitmqBlockingTaskQueueAdapter()
    
    @classmethod
    def prepare_dispatcher(cls, queue):
        cls.task_queue_adaptar.prepare_dispatcher(queue)
    
    @classmethod
    def publish(cls, queue, body):
        cls.task_queue_adaptar.publish(queue, body)