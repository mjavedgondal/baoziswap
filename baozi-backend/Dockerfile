FROM python:3.8

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install -y vim nano

ENV WORK_DIR /code

RUN mkdir $WORK_DIR
WORKDIR $WORK_DIR

COPY requirements.txt $WORK_DIR
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

COPY . $WORK_DIR