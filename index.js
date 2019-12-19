if(process.env.NODE_ENV=='development'){
  require('dotenv').config();
}
const core = require('@actions/core');
const github = require('@actions/github');

let TOKEN = core.getInput('github-token');
const githubClient = new github.GitHub(TOKEN || process.env.GITHUB_TOKE_DEV);
const PROJECT_URL = core.getInput('project_path')||process.env.PROJECT_URL;
const API_PROJECT_URL = 'https://api.github.com/users/alexismateo/projects';
const CARD_NAME = 'Issue';

async function main(){
    try {
      await getIssues();
        let project = await getProject();
        addCardToProject(project);
    
    } catch (error) {
      core.setFailed(error.message);
    }

}

async function getProject(){
  let projectId= parseInt(getProjectId(PROJECT_URL));
  let project = await githubClient.projects.get({url:API_PROJECT_URL,project_id:projectId});
  return project.data[0];
}

function getProjectId(PROJECT_URL){
  let projectId = PROJECT_URL.match(/.\/?$/g)[0];
  return projectId
}

function findCardByName(projectCards){
  return projectCards.data.find(card=>card.name==CARD_NAME);
}
async function getIssues(){
 let issues = await githubClient.repos.get({url:"https://api.github.com/repos/:owner/:repo/issues",owner:"alexismateo",repo:"vera"});
 return issues;
}

async function addCardToProject(project) {
  let projectId = project.id;
  let projectCards = await githubClient.projects.get({url:`https://api.github.com/projects/${projectId}/columns`,project_id:projectId});
  let card =  findCardByName(projectCards);

  await githubClient.projects.createCard({
    url:card.cards_url,
    column_id:card.id,
    note:"nasty",
    content_type:"Issue",
  });

}
main();