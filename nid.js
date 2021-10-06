import http from "http";
import fs from "fs";
import csvParser from "csv-parser";
import axios from "axios";
const server = http.createServer();
let index = 0; let cIndex = 0;
let csvData = [];
let nId = [];
async function prepare() {    
    await fs.readFile('active_nid.txt', 'utf8',(err, data) => {
        if (err) throw err;
        if (data.length) index = Number(data);
    })
    fs.createReadStream('label.csv')
    .pipe(csvParser())
    .on('data', (data) => csvData.push(data))
    .on('end', () => {
        action();
    })
    
}
async function action() {
    const companyUrl = (`https://www.myagedcare.gov.au/api/v1/find-a-provider/search?location=${encodeURIComponent(csvData[index]['label'])}&careType=agedCareHomes&roomType=dontMind&start=0&rows=20`);
    await axios.get(companyUrl).then(res => {
        let inSuburb = res.data.groups.inSuburb.docs;
        let outSuburb = res.data.groups.outSuburb.docs;
        inSuburb = [...inSuburb, ...outSuburb];
        let nidStr = '';
        inSuburb.map(item => {
            nidStr += item.nid + '\r\n';
        })
        fs.appendFile('nid.csv', nidStr, (err, data) => {
            if (err) throw err;
            fs.writeFile('active_nid.txt',String(index + 1),(errs, dats) => {
                if (errs) throw errs;
                else {
                    index ++;
                    if (index == csvData) {
                        console.log('finished');
                        return;
                    }
                    action();
                }
            })
        })
    })
}

prepare();
server.listen(4000);