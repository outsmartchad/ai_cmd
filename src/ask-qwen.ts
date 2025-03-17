import axios from 'axios';
import {readCsv} from "./extract-cmd-only"
import * as fs from 'fs';
import csv from 'csv-parser';
import * as fastcsv from 'fast-csv';
const API_URL = 'http://localhost:5005/v1/chat/completions'; // Replace with your actual API URL
//const USER_TOKEN = ''; // Replace with your actual user token
const USER_TOKEN = '';
const inputFile = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/cptc_combined_de_sim_kdtree.csv'; // Replace with your input file name
const outputFile = '/Users/chiwangso/Desktop/work_project/ai_cmd_score/processed/res_cptc_combined.csv'; // Replace with your input file name

interface ChatCompletionRequest {
    model: string;
    conversation_id?: string; // Optional
    messages: Array<{ role: string; content: string }>;
    stream?: boolean; // Optional
}

interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    choices: Array<{ message: { role: string; content: string }; index: number; finish_reason: string }>;
}

async function getChatCompletion(request: ChatCompletionRequest): Promise<any> {
    try {
        const response = await axios.post(API_URL, request, {
            headers: {
                Authorization: `Bearer ${USER_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching chat completion:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return getChatCompletion(request);
    }
}


async function getChatResponse(request:any){
    let res = "";
    await getChatCompletion(request)
    .then(response => {
        console.log(response);
        console.log('Chat Completion Response:', response.choices[0].message.content);
        res = response.choices[0].message.content;
    })
    .catch(err => {
        console.error('Error:', err);
    });
    if(res==="") {
        console.log("here3")
        await new Promise(resolve => setTimeout(resolve, 5000));
        return getChatResponse(request);
    }
    return res;
}
let global_error = "";
function convert_json(jsonString: string) {
    // Remove any leading or trailing whitespace
    jsonString = jsonString.trim();

    // Ensure the string is properly formatted JSON
    if (jsonString.startsWith('```json') && jsonString.endsWith('```')) {
        jsonString = jsonString.slice(8, -3).trim(); // Remove the ```json and the ending ```
    }

    try {
        const jsonObject = JSON.parse(jsonString);
        return jsonObject;
    } catch (error:any) {
        console.log(error)
        global_error = error.toString();
        
        return null;
    }
}
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
async function llm_process(raw_data:any[]){
   // console.log(raw_data);
   let cnt = 0;
   let res_of_cmd = '';
   let batch_cnt = 1;
   let batch_arr = [];
    for(const cmd of raw_data){
        console.log(cmd);
        batch_arr.push(cmd);

        res_of_cmd = res_of_cmd + `${batch_cnt}. ${cmd}\n`

        batch_cnt ++;
        cnt++;
        if(batch_cnt <=  30) continue;
        console.log(res_of_cmd);
        console.log(`req ${cnt+1}: `)
        const prompt = `You are a security assistant, we detected that the following command: ${res_of_cmd} is requested to our server for the first time, please indicate whether it is malicious, dangerous score from 1:low to 10:high and reason for the score in english, if it has only one command, in json format {"command":command,"score":score,"reason":reason}. if it has more than one command, in json format [{"command":command,"score":score,"reason":reason}, {"command":command,"score":score,"reason":reason},...], no need Explanation`;
        const request: ChatCompletionRequest = {

            model: 'qwen', // Modify as needed
            conversation_id: '97c6a27a488a4e3da87ef4e0e12fe9e6-f68392cc100e47ce8b1f464d32da311a',
            //conversation_id: '16c9997e19484309878ead2114d7fd9c-093ad2b10a2342b29d3d86f1fe095263',
            //conversation_id: '044c2d445169406f80dfec48d3b5ae51-5a96e2ef09744d5a8c2a76cb4dd80633',
            messages: [
                { role: 'user', content: `${prompt}` },
            ],
            stream: false, // Set to true if you want streaming response
        };
        let res = await getChatResponse(request);

        //let res:any = await getChatCompletionThoughOfficialAPI(prompt);
        let res_json:any = await convert_json(res);
        while(res_json===null){
            console.log("here2")
            await new Promise(resolve => setTimeout(resolve, 500));
            request.messages[0].content = request.messages[0].content +", last result has an error that can't parse to json: "+ global_error;
            console.log(request.messages[0].content);
            res = await getChatResponse(request);
            res_json = await convert_json(res);

        }
        let flag = false;
        while(!("score" in res_json) || !("reason" in res_json)){
            if(Array.isArray(res_json)){
                console.log("it's an array of objects")
                for(let i=0; i<res_json.length; i++){
                    console.log("command: ", res_json[i].command)
                    console.log("Score: ", res_json[i].score);
                    console.log("reason: ", res_json[i].reason);
                    
                    const string_to_write = `${res_json[i].command},${res_json[i].score},"${res_json[i].reason}"`;
                    writeRowToCsv(string_to_write);
                }
                flag = true;
                break;
            }else{
                console.log("here1");
                await new Promise(resolve => setTimeout(resolve, 500));
                res = await getChatResponse(request);
                res_json = await convert_json(res);
            }

        }
        if(flag){

        res_of_cmd = '';
        batch_cnt = 1;
        batch_arr = [];
             continue;}
        console.log("Score: ", res_json.score);
        console.log("reason: ", res_json.reason);
        const string_to_write = `${cmd},${res_json.score},"${res_json.reason}"`;
        writeRowToCsv(string_to_write);

        

    }
}
async function main(){
    let rawData:any[] = [];
    let old_res:any = {};
    await fs.createReadStream(outputFile)
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
    console.log(old_res);
    // Read the CSV file
    await fs.createReadStream(inputFile)
        .pipe(fastcsv.parse({ })) // Adjust depending on your CSV format
        .on('data', (row: any) => {
            // Concatenate all values in the row into a single string
            const concatenatedRow = `"`+row[0]+`"`;
            //console.log('Concatenated row:', concatenatedRow); // Log the concatenated result
            if(row[0] in old_res || concatenatedRow in old_res){
                console.log(`${row[0]} Processed already`);
            }else rawData.push(concatenatedRow); // Store the concatenated row in rawData
        })
        .on('end', () => {

            llm_process(rawData); // Process the concatenated data
        })
        .on('error', (error:any) => {
            console.error('Error reading CSV file:', error);
        });

}

main();