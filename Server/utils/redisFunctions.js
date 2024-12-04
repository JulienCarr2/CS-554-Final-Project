import redis from "redis";
import { flatten, unflatten } from "flat";

const client = redis.createClient();
await client.connect();

// Checking if a key exists in redis
export const checkKeyExists = async (key) => {
	return await client.exists(key);
};

// Store data in redis
export const storeDataInRedis = async (key, value, expiration = undefined) => {
	let serializedData = JSON.stringify(flatten(value));
	await client.set(key, serializedData, expiration ? { EX: expiration } : {});
};

// Get data from redis
export const getDataFromRedis = async (key, arrayReturnType = false) => {
	let data = unflatten(JSON.parse(await client.get(key)));
	return arrayReturnType ? Object.values(data) : data;
};

// Delete data from redis
export const deleteDataFromRedis = async (key) => {
	await client.del(key);
};
