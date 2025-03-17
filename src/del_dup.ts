import axios from 'axios';
import {readCsv} from "./extract-cmd-only"
import * as fs from 'fs';
import csv from 'csv-parser';
import * as fastcsv from 'fast-csv';
const API_URL = 'http://localhost:5005/v1/chat/completions'; // Replace with your actual API URL
//const USER_TOKEN = ''; // Replace with your actual user token
const USER_TOKEN = '';
const inputFile = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/combined.csv'; // Replace with your input file name
const input1File = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/processed/res_cleared_name_pw_concated.csv'
const outputFile = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/new_combined.csv'; // Replace with your input file name

function writeRowToCsv(row: string) {
    // Append the row to the CSV file
    fs.appendFile(outputFile, row + '\n', (err:any) => {
        if (err) {
            console.error('Error writing to CSV file:', err);
        } else {
            console.log('Row written to CSV file:', row);
        }
    });
}

async function main(){
    let rawData:any[] = [];
    let old_res:any = {};
    await fs.createReadStream(input1File)
        .pipe(fastcsv.parse({ })) // Adjust depending on your CSV format
        .on('data', (row: any) => {
            const concatenatedRow = `"`+row[0]+`"`;
            old_res[row[0]] = true;
            old_res[concatenatedRow] = true;
        })
        .on('end', () => {
        })
        .on('error', (error:any) => {
            console.error('Error reading CSV file:', error);
        });
    await new Promise(resolve => setTimeout(resolve, 3000));
    //console.log(old_res);
    // Read the CSV file
    await fs.createReadStream(inputFile)
        .pipe(fastcsv.parse({ })) // Adjust depending on your CSV format
        .on('data', (row: any) => {
            // Concatenate all values in the row into a single string
            const concatenatedRow = row[0];
            console.log(row)
            //console.log('Concatenated row:', concatenatedRow); // Log the concatenated result
            if(concatenatedRow in old_res){
                console.log(`${row[0]} Processed already`);
            }else rawData.push(concatenatedRow); // Store the concatenated row in rawData
        })
        .on('end', () => {

            //llm_process(rawData); // Process the concatenated data
        })
        .on('error', (error:any) => {
            console.error('Error reading CSV file:', error);
        });
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log(rawData)

}

main();