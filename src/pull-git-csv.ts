const axios = require('axios');
const fs = require('fs');

const url = "";

axios.get(url)
    .then((response:any) => {
        fs.writeFileSync('national_teams.csv', response.data);
    })
    .catch((error:any) => {
        console.error('Error downloading the file:', error);
    });