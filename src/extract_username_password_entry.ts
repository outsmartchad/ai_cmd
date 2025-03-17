import axios from 'axios';
import { readCsv } from "./extract-cmd-only";
import * as fs from 'fs';
import csv from 'csv-parser';

const res_cleared_file = "/Users/chiwangso/Desktop/work_project/ai_cmd_score/res_cleared.csv";
const output_file = "/Users/chiwangso/Desktop/work_project/ai_cmd_score/res_usrname_password_only.csv";
const output_file1 = "/Users/chiwangso/Desktop/work_project/ai_cmd_score/res_usrname_password_only1.csv"
// Regular expression to match the specified words
const regex = /\b(username|name|password|word)\b/i; // \b asserts word boundaries, i makes it case insensitive

function writeRowToCsv(row: string) {
    // Append the row to the CSV file
    fs.appendFile(output_file1, row + '\n', (err) => {
        if (err) {
            console.error('Error writing to CSV file:', err);
        } else {
            console.log('Row written to CSV file:', row);
        }
    });
}
async function main1() {
    let rawData: any[] = [];
    let old_res: any = {};

    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(output_file)
            .pipe(csv({ separator: ',', quote: '"', escape: '\\' })) // Adjust depending on your CSV format
            .on('data', (row: any) => {
                console.log('Row data:', row); // Log the entire row
                const reason = row["reason"];
                const score = row["score"];
                const command = row["command"];


                old_res[command] = true; // Set command key to true in the object
                
            })
            .on('end', () => {
                console.log('CSV reading completed.');
                console.log(old_res);
                resolve(); // Resolve the promise when done
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject(error); // Reject the promise on error
            });
    });

    fs.createReadStream(res_cleared_file)
        .pipe(csv({ separator: ',', quote: '"', escape: '\\' })) // Adjust depending on your CSV format
        .on('data', (row: any) => {
            // Concatenate all values in the row into a single string
            const reason = row["reason"];
            const score = row["score"];
            const command = row["command"];

            // Check if the reason matches the regex
            if(command in old_res){
                writeRowToCsv(`${command},${score},${reason}`)
            }
        })
        .on('end', () => {
            // Optionally, process rawData here if needed
            console.log('CSV reading completed.');
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}
async function main() {
    let rawData: any[] = [];
    let old_res: any = {};

    fs.createReadStream(res_cleared_file)
        .pipe(csv({ separator: ',', quote: '"', escape: '\\' })) // Adjust depending on your CSV format
        .on('data', (row: any) => {
            // Concatenate all values in the row into a single string
            const reason = row["reason"];
            const score = row["score"];
            const command = row["command"];
            rawData.push(reason);

            // Check if the reason matches the regex
            if (regex.test(reason)) {
                console.log(`Matched: command: ${command}, \nreason: ${reason}`);
                writeRowToCsv(`${command},${score},${reason}`)
                // Optionally, you can write to the output file or handle the matched entry here
            }
        })
        .on('end', () => {
            // Optionally, process rawData here if needed
            console.log('CSV reading completed.');
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

main();