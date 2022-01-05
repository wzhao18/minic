import logging

from minic_server.restapi.server import minic_server, initialize

def create_app():
    initialize()
    gunicorn_logger = logging.getLogger('gunicorn.error')
    minic_server.logger.handlers = gunicorn_logger.handlers
    minic_server.logger.setLevel(gunicorn_logger.level)

    return minic_server