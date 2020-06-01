# MQ-lib [![Node.js CI](https://github.com/Marc-JB/mq-lib/workflows/Node.js%20CI/badge.svg)](https://github.com/Marc-JB/mq-lib/actions?query=workflow%3A%22Node.js+CI%22) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Marc-JB_mq-lib&metric=alert_status)](https://sonarcloud.io/dashboard?id=Marc-JB_mq-lib) [![license](https://badgen.net/github/license/Marc-JB/mq-lib?color=cyan)](https://github.com/Marc-JB/mq-lib/blob/master/LICENSE) [![npm](https://badgen.net/badge/icon/npm?icon=npm&color=cyan&label)](https://www.npmjs.com/package/@peregrine/mq-lib) ![node version](https://badgen.net/npm/node/@peregrine/mq-lib) ![types](https://badgen.net/npm/types/@peregrine/mq-lib?icon=typescript)
Very simple and minimal amqplib wrapper.

## Methods - MqService class
Method | Description
--- | ---
```static connectOnce(url: string): Promise<MqService>``` | Creates a connection to the RabbitMQ instance at the specified `url`.
```static connect(url: string, maxNumOfTries = 10): Promise<MqService>``` | Creates a connection to the RabbitMQ instance at the specified `url`. Tries to connect at least 10 times (unless otherwise specified).
```addListener(queueName: string, listener: (data: string) => Promise<boolean>): void``` | Adds a listener to the queue with name `queueName`. When the listener returns a true, an ACK is sent.
```sendMessage(queueName: string, data: Json)``` | Sends a message to the queue with name `queueName`. The message can be a string or JSON.
```close(): Promise<void>``` | Closes the connection
