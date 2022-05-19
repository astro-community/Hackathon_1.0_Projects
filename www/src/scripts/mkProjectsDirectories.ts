import * as fs from 'node:fs/promises'
import Path from 'node:path'
import { existsSync } from 'node:fs'
import NotionData from '../data/notion.json'
import formatCategoryString from './formatCategoryString'

export function Pathsetter(creationPath:string,projectPath:string){
    return Path.join(process.cwd(),creationPath,projectPath)
}

export function generateProjectPaths(){
    return NotionData.map(({Name,Category})=>{
        return `${formatCategoryString(Category)}/${Name.toLowerCase()}`
    })
}

export async function mkProjectDirectories(creationPath:string,projectPath:string){
    try {
        let path = Pathsetter(creationPath,projectPath).toString()
        if(!existsSync(Pathsetter(creationPath,projectPath))){
            console.log('Folder doesnt exist')
          return fs.mkdir(path,{recursive:true})
        }
        }
     catch (error) {
        console.log('Error creating directory @:', Pathsetter(creationPath,projectPath))
    }
}
