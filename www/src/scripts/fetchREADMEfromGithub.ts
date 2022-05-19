export default async function fetchREADMEfromGithub(user:string,project:string):Promise<string>{
    return  await (await fetch(`https://raw.githubusercontent.com/${user}/${project}/main/README.md`)).text()
}