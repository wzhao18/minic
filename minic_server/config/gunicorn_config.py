import os

PORT = os.environ.get("MINIC_SERVER_PORT", "23450")
bind = f"0.0.0.0:{PORT}"
workers = os.environ.get("GUNICORN_NUM_WORKERS", 2)
threads = os.environ.get("GUNICORN_NUM_THREADS", 2)
timeout = os.environ.get("GUNICORN_WORKER_TIMEOUT", 90)