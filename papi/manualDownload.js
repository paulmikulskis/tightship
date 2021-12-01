import { PAIClient } from "./pai-client.js";
import { PAIClient as MockPAIClient } from './mock-pai-client.js';
import { subDays, format } from 'date-fns';
import { formatISO9075 } from 'date-fns'
import dfd from "danfojs-node";
import fs from "fs";


const arg = process.argv[2].trim('"')


const client = new PAIClient(subDays(new Date(), 365))
console.log('client age: ', client.inception)
await client.login('sergiog', 'Junesixteen2021')
var report = await client.downloadReport(arg)
if (report) {

    // for (var key of Object.keys(rep)) {
    //     rep[key]['Trx Time'] = formatISO9075(  new Date(rep[key]['Trx Time']).setHours(0, 0, 0, 0)  )
    // }
    
    //report.print()
    let data = JSON.stringify(report.to_json());
    fs.writeFileSync(`${arg.replace(/[ ]+/g,"_").toLocaleLowerCase()}-MOCK.json`, data);
    


} else {
    console.log('no data found for this report, the client returned', undefined)
    console.log('there was either an error (check papi logs) or no recent data within the search timeframe')
}



// .eq(
//     ( new Date('10/23/21') ).setHours(0, 0, 0, 0)
// )
