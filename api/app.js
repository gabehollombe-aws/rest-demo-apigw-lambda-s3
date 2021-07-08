const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const BUCKET = process.env.BUCKET_NAME;

exports.lambdaHandler = async (event, context) => {
    let response;
    try {
        const resource = event.resource;
        const method = event.httpMethod;
        const key = event.pathParameters.key;
        const body = JSON.parse(event.body);
        
        if (resource !== "/{key}") throw new Error(`Can't handle request for resource ${resource}`)
        if (key === null) throw new Error(`Missing object key`)
        
        let result;
        if (method === "POST") {
            result = await S3.putObject({ Bucket: BUCKET, Key: key, Body: body.data }).promise();
        }
        if (method === "GET") {
            result = await S3.getObject({ Bucket: BUCKET, Key: key }).promise();
            result.stringifiedBody = result.Body.toString();
        }
        if (!result) {
            throw new Error(`Can't handle ${resource}`)
        }
        
        response = {
            'statusCode': 200,
            'body': JSON.stringify({result})
        }
    } catch (error) {
        console.error(error);
        response = {
            'statusCode': 500,
            'body': JSON.stringify({error})
        }
    }
    return response;
};
