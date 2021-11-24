import { config } from 'tightship-config';
import twilio from 'twilio';

//console.log(`Twilio sid=${config.get('twilio.sid')}\nTwilio key=${config.get('twilio.apiKey')}`)
export const client = twilio(config.get('twilio.sid'), config.get('twilio.apiKey'));

export const sendMessage = async (message, number) => {
    console.log(`twilio sending message to ${number}:\n${message}`);
    return client.messages
        .create({
            body: message,
            messagingServiceSid: config.get('twilio.serviceId'),
            to: number
        })
        .then(message => { return message });
};
