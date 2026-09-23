import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist'),port=Number(process.env.PORT||5173);
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.zip':'application/zip'};
http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}
if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}if(file===root||file.endsWith(path.sep))file=path.join(file,'index.html');
fs.stat(file,(err,s)=>{if(err||!s.isFile()){res.writeHead(404).end('Not found');return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
}).listen(port,'127.0.0.1',()=>console.log(`Local app: http://127.0.0.1:${port}`));
