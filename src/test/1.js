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
               errorHandler(500,err)
            }
            res.statusCode=200
            res.setHeader('Content-Type','application/json')
            res.end(data)
            return 
        })
        return 
    }
    else if(method=='POST'&&pathname=='/api/v1/user'){
        const buffer=[]
        req.on('data',chunk=>{
            buffer.push(chunk)
        })
        req.on('end',()=>{
            const insert=JSON.parse(Buffer.concat(buffer).toString())
            if(insert.name==null){
               errorHandler(422,{message:'name required',statusCode:422,statusMessage:'bad request'})
               return
            }
            const dataPath=path.join(__dirname,`../data/${insert.name}.json`)
            fs.writeFile(dataPath,JSON.stringify(insert),'utf8',(err)=>{
                if(err){
                    console.error('写入失败')
                     errorHandler(500,err)
                }
                res.status=200
                res.statusCode=200
                res.setHeader('Content-Type','application/json')
                res.end(JSON.stringify({
                    success:true,
                    message:'写入成功'
                }))
            })
        })
        return 
    }
    function errorHandler(status,err){
        console.error(`[Error]${req.method}${req.url},err`)
        res.statusCode=status
        res.statusMessage=err?.statusMessage
        res.setHeader('Content-Type','application/json')
        res.end(JSON.stringify({
            success:false,
            message:err?.message
        }))
    }
}

const server=http.createServer(handler)
server.listen(3000,()=>{
    console.log('Server run on http://localhost:3000');
})
