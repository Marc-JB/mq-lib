import amqp from "amqplib/callback_api"
import { Json } from "./jsonType"
import { tryFunction } from "./asyncUtils"

export class MqService {
    private constructor(private channel: amqp.Channel) {}

    public addListener(queueName: string, listener: (data: string) => Promise<boolean>) {
        this.channel.assertQueue(queueName)
        this.channel.consume(queueName, async (message) => {
            if (message !== null) {
                const parsedMesssage = message.content.toString()
                const messageProcessed = await listener(parsedMesssage)
                if (messageProcessed)
                    this.channel.ack(message)
            }
        })
    }

    public sendMessage(queueName: string, data: Json) {
        const stringifiedData = typeof data === `string` ? data : JSON.stringify(data)
        this.channel.assertQueue(queueName)
        this.channel.sendToQueue(queueName, Buffer.from(stringifiedData))
    }

    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.channel.close(error => error ? reject(error): resolve())
        })
    }

    public static connectOnce(url: string): Promise<MqService> {
        return new Promise((resolve, reject) => {
            amqp.connect(url, (error, connection) => {
                if(error) reject(error)
                else connection.createChannel((err, channel) => {
                    if (err) reject(err)
                    else resolve(new MqService(channel))
                })
            })
        })
    }

    public static connect(url: string, maxNumOfTries = 10): Promise<MqService> {
        return tryFunction(() => this.connectOnce(url), maxNumOfTries)
    }
}
