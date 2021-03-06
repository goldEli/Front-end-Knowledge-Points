

var express = require("express");
const axios = require("axios");
var fs = require("fs");
var moment = require('moment');
var execSync = require('child_process').execSync;

const app = express()
const port = 3000

const getAllIssues = async () => {
  return new Promise((resolve, reject) => {
    axios
      .get("https://api.github.com/repos/goldEli/blog/issues?state=open")
      .then(response => {
        const { data = [] } = response || {};
        if (data.length === 0) return;
        const items = data.map((item, index) => {
          const { html_url, title, created_at, updated_at } = item;
          return `* [${index +
            1}. ${title}](${html_url}) —— ${moment(created_at).format('YYYY-MM-DD')}`;
        });
        resolve(items);
      })
      .catch(err => resolve(null))
  });
  // res.send(items.join(""));
};

const readReadMe = dir => {
  return new Promise((resolve, reject) => {
    fs.readFile(dir, "utf-8", (err, data) => {
      resolve(data);
      console.log("Successfully Read File.");
    });
  })
};

const writeToReadMe = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, err => {
      if (err) {
        console.log(err)
        resolve('error')
        return 
      };
      resolve('success')
      console.log("Successfully Written to File.");
    });
  })
};

const replaceQA = (content, allIssues) => {
  const newContent = []
  let clearState = false
  content
    .split('\n')
    .forEach(item => {
      if (item.includes('### Q&A')) {
        clearState = true
        newContent.push(item)
        allIssues.forEach(issue => {
          newContent.push(issue)
        })
      }
      if (item.includes('### Reference')) {
        clearState = false
        
      }
      !clearState && newContent.push(item)
    });
  return newContent.join('\n')
}

const pushReadMe = () => {
  execSync('git pull');
  execSync('git add README.md');
  execSync(`git commit -m "${moment().format('LLLL')} modify README 💐💐💐💐💐💐"`);
  execSync('git push origin master');
}

app.post('/github', async (req, res) => {
  const allIssues = await getAllIssues();
  const readMePath = "README.md"
  
  const content = await readReadMe(readMePath);
  const newContent = replaceQA(content, allIssues)
  const state = await writeToReadMe(readMePath, newContent)
  try {
    state === "success" && pushReadMe()
  } catch (error) {
    console.log(error)
  } finally{
    res.send("success"); 
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
