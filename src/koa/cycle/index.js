export class Cycle{
  constructor(){
    this.middlewares=[]
    for(const method of ['GET','POST',"DELETE",'PUT','HEAD','PATCH']){
      // cycle.get('/api',callback)
      this[method.toLowerCase()]=(pattern,fn)=>{
        this.middlewares.push({method,pattern,fn})
        return this
      }
    }
  }
}