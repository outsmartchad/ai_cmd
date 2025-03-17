import * as fs from 'fs';
import csv from 'csv-parser';
import * as fastcsv from 'fast-csv';
const prefix = "/Users/chiwangso/Desktop/work_project/ai_cmd_score/";
const input_file = `${prefix}res_usrname_password_only1.csv`;
const output_cleared_name_pw_file = `${prefix}res_usrname_password_only_concated.csv`;

function writeRowToCsv(row: string) {
    // Append the row to the CSV file
    fs.appendFile(output_cleared_name_pw_file, row + '\n', (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err);
        } else {
            console.log('Row written to CSV file:', row);
        }
    });
}

async function main() {
    await new Promise<void>((resolve, reject) => {
        const results: any[] = [];

        fs.createReadStream(input_file)
            .pipe(fastcsv.parse({ }))
            .on('data', (row) => {
                const score = row[1];
                const command = row[0];
                let reason = '';
                for(let i =2; i<row.length; i++) reason= reason+row[i];

                // Write the row to the output CSV
                writeRowToCsv(`${command},${score},${reason}`);
            })
            .on('end', () => {
                console.log('CSV write completed.');
                resolve(); // Resolve the promise when done
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject(error); // Reject the promise on error
            });
    });
}

main();