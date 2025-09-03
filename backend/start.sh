#!/bin/bash
# start.sh - run FastAPI with uvicorn for production
uvicorn main:app --host 0.0.0.0 --port $PORT
