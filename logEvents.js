import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

import { existsSync } from 'node:fs'
//import { promises as fsPromises } from 'fs'
import { mkdir, appendFile }from 'node:fs/promises'
import path from 'path'

export const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuidv4()}\t${message}\n`;
    console.log(logItem);
    try {
         if(!existsSync('./logs')) {
         await mkdir('logs');
         }
         await appendFile(('logs', logName), logItem);
        } catch (err) {
           console.log(err);
    }
}

//export { path, dirname };
