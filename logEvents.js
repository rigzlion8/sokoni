import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

import fs from 'fs'
//import { promises as fsPromises } from 'fs'
import * as fsPromises from 'node:fs/promises'
import path from 'path'

export const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuidv4()}\t${message}\n`;
    console.log(logItem);
    try {
         if(!fs.existsSync('logs')) {
         await fsPromises.mkdir('logs');
         }
         await fsPromises.appendFile(('logs', logName), logItem);
        } catch (err) {
           console.log(err);
    }
}

//export { path, dirname };
