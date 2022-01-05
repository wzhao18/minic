import pika
from pika import BlockingConnection, ConnectionParameters
from pika.adapters.blocking_connection import BlockingChannel

from threading import Thread
from typing import Dict, Tuple
import functools
import os
import json

from minic_logger.logger import minic_logger
rabbitmq_logger = minic_logger("rabbitmq", "DEBUG")

RABBITMQ_HOST = os.environ.get("RABBITMQ_HOST", "localhost")
CONNECTION_PARAMETERS = ConnectionParameters(host=RABBITMQ_HOST, port=5672, connection_attempts=10, retry_delay=10, heartbeat=0)

def callback(ch, method, properties, body):
    rabbitmq_logger.info(" [x] Received %r" % body)
    ch.basic_ack(delivery_tag = method.delivery_tag)

class RabbitmqBlockingExchangeAdapter:
    connection_map: Dict[str, Tuple[BlockingConnection, BlockingChannel]]

    class Consumer(Thread):
        service: str
        connection: BlockingConnection
        channel: BlockingChannel

        def __init__(self, owner, service, publish_exchange, consume_exchange, exchange_type, routing_keys, on_message_callback):
            super().__init__(name=f"{service}-consumer")
            self.owner : RabbitmqBlockingExchangeAdapter = owner
            self.service = service
            self.connection = BlockingConnection(CONNECTION_PARAMETERS)
            publish_channel = self.connection.channel()
            consume_channel = self.connection.channel()

            publish_channel.exchange_declare(exchange=publish_exchange, exchange_type=exchange_type)
            consume_channel.exchange_declare(exchange=consume_exchange, exchange_type=exchange_type)
            result = consume_channel.queue_declare(queue='', exclusive=True)
            queue_name = result.method.queue
            for routing_key in routing_keys:
                consume_channel.queue_bind(exchange=consume_exchange, queue=queue_name, routing_key=routing_key)

            consume_channel.basic_consume(queue=queue_name, on_message_callback=on_message_callback)
            self.channel = consume_channel
            self.owner.connection_map[service] = (self.connection, publish_channel)

        def run(self):
            rabbitmq_logger.info(f"Start consuming messages from service {self.service}")
            self.channel.start_consuming()

    def __init__(self):
        self.connection_map = {}

    def publish(self, service, exchange, routing_key, body):
        body_binary = json.dumps(body).encode('utf-8')
        connection, publish_channel = self.connection_map[service]
        properties = pika.BasicProperties(delivery_mode = pika.spec.PERSISTENT_DELIVERY_MODE)
        partial = functools.partial(publish_channel.basic_publish, exchange=exchange, routing_key=routing_key, body=body_binary, properties=properties)
        connection.add_callback_threadsafe(partial)

    def subscribe(self, service, publish_exchange, consume_exchange, exchange_type, routing_keys, on_message_callback=callback):
        if service not in self.connection_map:
            consumer = RabbitmqBlockingExchangeAdapter.Consumer(self, service, publish_exchange, consume_exchange, exchange_type, routing_keys, on_message_callback)
            consumer.start()

    def disconnect(self):
        for service in self.connection_map:
            service_connection = self.connection_map[service][0]
            service_connection.close()

class RabbitmqBlockingTaskQueueAdapter:
    connection: BlockingConnection
    channels: Dict[str, BlockingChannel]

    class Consumer(Thread):
        queue: str
        connection: BlockingConnection
        channel: BlockingChannel

        def __init__(self, queue, on_message_callback):
            super().__init__(name=f"{queue}-consumer")
            self.queue = queue
            self.connection = BlockingConnection(CONNECTION_PARAMETERS)
            consume_channel = self.connection.channel()

            consume_channel.basic_qos(prefetch_count=1)
            consume_channel.queue_declare(queue=queue, durable=True)
            consume_channel.basic_consume(queue=queue, on_message_callback=on_message_callback)
            self.channel = consume_channel

        def run(self):
            rabbitmq_logger.info(f"Start consuming messages from queue {self.queue}")
            self.channel.start_consuming()

    def __init__(self):
        self.connection = None
        self.channels = {}

    def prepare_dispatcher(self, queue):
        if not self.connection:
            self.connection = BlockingConnection(CONNECTION_PARAMETERS)
        if queue not in self.channels:
            channel = self.connection.channel()
            self.channels[queue] = channel
            channel.queue_declare(queue=queue, durable=True)

    def publish(self, queue, body):
        body_binary = json.dumps(body).encode('utf-8')
        properties = pika.BasicProperties(delivery_mode = pika.spec.PERSISTENT_DELIVERY_MODE)
        self.channels[queue].basic_publish(exchange='', routing_key=queue, body=body_binary, properties=properties)

    def subscribe(self, queue, on_message_callback=callback):
        consumer = RabbitmqBlockingTaskQueueAdapter.Consumer(queue, on_message_callback)
        consumer.start()

    def disconnect(self):
        if self.connection:
            self.connection.close()


