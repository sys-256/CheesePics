// Get variables from config.json
import { config } from "../../config.js";

// Import packages
import forge from 'node-forge';
import Memcached from "memcached";
const memcached = new Memcached(`${config.memcached.url}:${config.memcached.port}`);