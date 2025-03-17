import * as fs from 'fs';
import csv from 'csv-parser';

const inputFile = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/unquie_national_team.csv'; // Replace with your input file name
const outputFile = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/unquie_national_teams.csv'; // Name for the new output file

export async function readCsvAndDedupRows() {
    const rawData: string[] = [];

    // Read the CSV file
    fs.createReadStream(inputFile)
        .pipe(csv())
        .on('data', (row: any) => {
            if (row['_raw']) {
                rawData.push(row['_raw']); // Extract the _raw column
            }
        })
        .on('end', () => {
            // Deduplicate the _raw values
            const uniqueRawData = Array.from(new Set(rawData));
            console.log('Unique _raw values:', uniqueRawData.length);

            // Write to a new CSV file
            fs.writeFileSync(outputFile, '_raw\n' + uniqueRawData.join('\n'));
            console.log(`Extracted unique _raw data saved to ${outputFile}`);
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

let rawData: string[] = [];
export async function readCsv() {


    // Read the CSV file
    await fs.createReadStream(outputFile)
        .pipe(csv())
        .on('data', (row: any) => {
            //console.log(row['_raw'])
            rawData.push(row['_raw']); // Extract the _raw column
            

        })
        .on('end', () => {
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
        return rawData;
        
}

// // Execute the function
// readCsvAndDedupRows();