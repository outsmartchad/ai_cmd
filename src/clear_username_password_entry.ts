import axios from 'axios';
import { readCsv } from "./extract-cmd-only";
import * as fs from 'fs';
import csv from 'csv-parser';
const prefix = "/Users/chiwangso/Desktop/work_project/ai_cmd_score/"
const res_cleared_file = `${prefix}res_cleared.csv`;
const output_file = `${prefix}res_usrname_password_only.csv`;
const output_cleared_name_pw_file = `${prefix}res_cleared_name_pw.csv`;
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

async function writeCleared_entry(name_pw_res:any){
    await fs.createReadStream(res_cleared_file)
        .pipe(csv({ separator: ',', quote: '"', escape: '\\' })) // Adjust depending on your CSV format
        .on('data', (row: any) => {
            // Concatenate all values in the row into a single string
            const reason = row["reason"];
            const score = row["score"];
            const command = row["command"];
            if(command in name_pw_res){
                console.log(command);
            }else{
                writeRowToCsv(`${command},${score},${reason}`);
            }
        })
        .on('end', () => {
            // Optionally, process rawData here if needed
            console.log('CSV write completed.');
            
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });

}
async function main() {
    let rawData: any[] = [];
    let name_pw_res: any = {};
    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(output_file)
            .pipe(csv({ separator: ',', quote: '"', escape: '\\' })) // Adjust depending on your CSV format
            .on('data', (row: any) => {
                console.log('Row data:', row); // Log the entire row
                const reason = row["reason"];
                const score = row["score"];
                const command = row["command"];


                name_pw_res[command] = true; // Set command key to true in the object
                
            })
            .on('end', () => {
                console.log('CSV reading completed.');
                console.log(name_pw_res);
                resolve(); // Resolve the promise when done
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject(error); // Reject the promise on error
            });
    });
    
    writeCleared_entry(name_pw_res);

}

main();