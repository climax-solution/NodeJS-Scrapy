import http from "http";
import fs from "fs";
import csvParser from "csv-parser";
import axios from "axios";
const server = http.createServer();
let index = 0; let cIndex = 0;
let csvData = [];
let nId = [];
async function prepare() {    
    await fs.readFile('active_log.txt', 'utf8',(err, data) => {
        if (err) throw err;
        if (data.length) index = typeof Number(data) == 'number' ? Number(data) : 0;
    })
    fs.createReadStream('nid.csv')
    .pipe(csvParser())
    .on('data', (data) => csvData.push(data))
    .on('end', () => {
        action();
    })
    
}

async function action() {
    const item = await axios(`https://www.myagedcare.gov.au/api/v1/find-a-provider/details/aged-care-home/${csvData[index]['nid']}/summary`).then(res => {return res.data});
    const { serviceProvider: service } = item;
    const name = item.name, address = `${service['address']} ${service['address2']}`, website = item.website;
    const phone = service['phone'], email = service['email'], fax = service['fax'];
    let logs = `${name},${address},${phone},${fax},${email},${website}\r\n`;
    if (!item.length) logs = '';
    fs.appendFile('log.csv', logs, function (err) {
        if (err) throw err;
        fs.writeFile('active_log.txt',String(index + 1),(errs, dats) => {
            if (errs) throw errs;
            else {
                index ++;
                if (index == csvData.length) {
                    console.log('finished');
                    return;
                }
                action();
            }
        })
    });
}
prepare();
server.listen(4000);