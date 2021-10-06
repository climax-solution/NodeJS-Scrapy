import http from "http";
import fs from "fs";
import csvParser from "csv-parser";
import axios from "axios";
const server = http.createServer();
let index = 0; let cIndex = 0;
let csvData = [];
let nId = [];
async function prepare() {    
    fs.readFileSync('active_label.txt', 'utf8',(err, data) => {
        if (err) throw err;
        if (data.length) index = Number(data);
    })
    fs.createReadStream('postcode.csv')
    .pipe(csvParser())
    .on('data', (data) => csvData.push(data))
    .on('end', () => {
        action();
    })
    
}
async function action() {
    const companyUrl = (`https://www.myagedcare.gov.au/locality-autocomplete?q=${csvData[index]['postcode']}`);
    await axios.get(companyUrl).then(res => {
        const { data } = res;
        let label = '';
        data.map(item => {
            label += item.value + '\r\n';
        })
        fs.appendFile('label.csv', label, (err, data) => {
            if (err) throw err;
            fs.writeFile('active_label.txt',String(index + 1),(errs, dats) => {
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
        })
    })
}

prepare();
server.listen(4000);