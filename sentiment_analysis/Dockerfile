FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt flask-debugtoolbar

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_ENV=development
ENV FLASK_DEBUG=1
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV DATABASE_PATH=/app/db.db 

EXPOSE 5233
CMD ["flask", "run", "--host=0.0.0.0", "--port=5233", "--reload", "--debugger"]