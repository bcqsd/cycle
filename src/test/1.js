import fs from 'fs'
import URL from 'url'
import http from 'http'
import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
function handler(req,res){
    //从request里获取http请求的信息
    const {method,url}=req
    //用URL.parse解析url
    const {pathname,query} =URL.parse(url,true)
    if(method ==='GET' && pathname==='/api/v1/user'){
        const name=query?.name
        const dataPath=path.join(__dirname,`../data/${name}.json`)
        fs.readFile(dataPath,'utf8',(err,data)=>{
            if(err){
                res.statusCode=500
            }
            res.statusCode=200
            res.setHeader('Content-Type','application/json')
            res.end(data)
            return 
        })
        return 
    }
    res.end('Hello Node\n')
}

const server=http.createServer(handler)
server.listen(3000,()=>{
    console.log('Server run on http://localhost:3000');
})